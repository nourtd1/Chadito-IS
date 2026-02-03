"use client"

import { useEffect, useState } from "react"
import { supabaseAdmin } from "@/lib/supabase"
import type { Profile } from "@/types/profile"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Ban, Search, UserCheck, ShieldAlert, ShoppingBag, History } from "lucide-react"

export default function UsersPage() {
    const [users, setUsers] = useState<Profile[]>([])
    const [filteredUsers, setFilteredUsers] = useState<Profile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    // MOCK DATA for CRM
    const MOCK_USERS: Profile[] = [
        {
            id: "u1",
            created_at: "2024-01-15T10:00:00Z",
            email: "alice.martin@example.com",
            first_name: "Alice",
            last_name: "Martin",
            city: "Paris",
            verification_status: 'verified',
            role: 'seller',
            status: 'active',
            ads_count: 12,
            reports_count: 0
        },
        {
            id: "u2",
            created_at: "2024-02-20T14:30:00Z",
            email: "bob.dupont@example.com",
            first_name: "Bob",
            last_name: "Dupont",
            city: "Lyon",
            verification_status: 'none',
            role: 'user',
            status: 'active',
            ads_count: 0,
            reports_count: 1
        },
        {
            id: "u3",
            created_at: "2024-03-05T09:15:00Z",
            email: "charlie.bad@example.com",
            first_name: "Charlie",
            last_name: "Bad",
            city: "Marseille",
            verification_status: 'rejected',
            role: 'seller',
            status: 'suspended',
            ads_count: 5,
            reports_count: 8
        }
    ]

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error || !data || data.length === 0) {
                setUsers(MOCK_USERS)
            } else {
                // Mapping pour s'assurer que les champs optionnels existent
                const formattedUsers: Profile[] = data.map((u: any) => ({
                    ...u,
                    city: u.city || 'Non renseigné',
                    role: u.role || 'user',
                    status: u.status || 'active'
                }))
                setUsers(formattedUsers)
            }
        } catch (err) {
            setUsers(MOCK_USERS)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    // Filtrage
    useEffect(() => {
        let result = users

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase()
            result = result.filter(u =>
                (u.email?.toLowerCase().includes(lowerQuery)) ||
                (u.last_name?.toLowerCase().includes(lowerQuery)) ||
                (u.first_name?.toLowerCase().includes(lowerQuery))
            )
        }

        if (statusFilter !== 'all') {
            if (statusFilter === 'verified') {
                result = result.filter(u => u.verification_status === 'verified')
            } else if (statusFilter === 'unverified') {
                result = result.filter(u => u.verification_status !== 'verified')
            }
        }

        setFilteredUsers(result)
    }, [searchQuery, statusFilter, users])


    const handleOpenDetails = (user: Profile) => {
        setSelectedUser(user)
        setIsDialogOpen(true)
    }

    const handleBanUser = async () => {
        if (!selectedUser) return
        if (!confirm(`Êtes-vous sûr de vouloir BANNIR définitivement ${selectedUser.first_name} ${selectedUser.last_name} ?`)) return

        setActionLoading(true)
        try {
            await supabaseAdmin.from('profiles').update({ status: 'banned' }).eq('id', selectedUser.id)

            // Update local state
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: 'banned' } : u))
            setIsDialogOpen(false)
        } catch (e) {
            console.error(e)
            alert('Erreur lors du bannissement')
        } finally {
            setActionLoading(false)
        }
    }

    const getStatusBadge = (status: string, verification_status: string) => {
        if (status === 'banned') return <Badge variant="destructive">Banni</Badge>
        if (status === 'suspended') return <Badge className="bg-orange-500">Suspendu</Badge>

        if (verification_status === 'verified') return <Badge className="bg-green-600 hover:bg-green-700">Vérifié</Badge>
        if (verification_status === 'pending') return <Badge variant="secondary" className="text-yellow-600 bg-yellow-100">En attente</Badge>

        return <Badge variant="outline">Non vérifié</Badge>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h2>
                    <p className="text-muted-foreground">{filteredUsers.length} utilisateurs trouvés</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par nom ou email..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-[180px]">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrer par statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                <SelectItem value="verified">Vérifiés</SelectItem>
                                <SelectItem value="unverified">Non vérifiés</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Ville</TableHead>
                            <TableHead>Inscription</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Chargement...</TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Aucun utilisateur trouvé.</TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.first_name} {user.last_name}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.city || '-'}</TableCell>
                                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded", user.role === 'seller' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700")}>
                                            {user.role === 'seller' ? 'Vendeur' : 'Standard'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(user.status, user.verification_status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="ghost" onClick={() => handleOpenDetails(user)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Fiche Détaillée Utilisateur */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Fiche Utilisateur : {selectedUser?.first_name} {selectedUser?.last_name}</DialogTitle>
                        <DialogDescription>ID: {selectedUser?.id}</DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="grid gap-6 py-4">
                            {/* Stats Rapides */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="border rounded-lg p-3 text-center bg-muted/20">
                                    <ShoppingBag className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                                    <div className="text-2xl font-bold">{selectedUser.ads_count ?? 0}</div>
                                    <div className="text-xs text-muted-foreground">Annonces</div>
                                </div>
                                <div className="border rounded-lg p-3 text-center bg-muted/20">
                                    <ShieldAlert className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                                    <div className="text-2xl font-bold text-orange-600">{selectedUser.reports_count ?? 0}</div>
                                    <div className="text-xs text-muted-foreground">Signalements Reçus</div>
                                </div>
                                <div className="border rounded-lg p-3 text-center bg-muted/20">
                                    <UserCheck className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                                    <div className="text-sm font-semibold mt-2">
                                        {selectedUser.verification_status === 'verified' ? 'Identité Vérifiée' : 'Non Vérifié'}
                                    </div>
                                </div>
                            </div>

                            {/* Infos Contact */}
                            <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Email:</span>
                                    <p>{selectedUser.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Ville:</span>
                                    <p>{selectedUser.city || 'Non renseigné'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Téléphone:</span>
                                    <p>{selectedUser.phone || 'Non renseigné'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-semibold text-muted-foreground">Compte créé le:</span>
                                    <p>{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Historique Placeholder */}
                            <div className="border rounded-md p-4 bg-muted/10">
                                <h4 className="flex items-center gap-2 font-semibold mb-2">
                                    <History className="h-4 w-4" /> Activité Récente
                                </h4>
                                <ul className="text-sm space-y-2 text-muted-foreground">
                                    <li>• Connexion détectée le {new Date().toLocaleDateString()}</li>
                                    {selectedUser.reports_count && selectedUser.reports_count > 0 && (
                                        <li className="text-destructive font-medium">• A reçu {selectedUser.reports_count} signalements sur ses annonces.</li>
                                    )}
                                    {selectedUser.ads_count && selectedUser.ads_count > 0 && (
                                        <li>• A publié {selectedUser.ads_count} annonce(s).</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        {selectedUser?.status !== 'banned' && (
                            <Button
                                variant="destructive"
                                className="w-full sm:w-auto"
                                onClick={handleBanUser}
                                disabled={actionLoading}
                            >
                                <Ban className="mr-2 h-4 w-4" />
                                Bannir l'utilisateur
                            </Button>
                        )}
                        {selectedUser?.status === 'banned' && (
                            <Button variant="outline" disabled className="w-full sm:w-auto border-destructive text-destructive opacity-100">
                                <Ban className="mr-2 h-4 w-4" />
                                Utilisateur Banni
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
