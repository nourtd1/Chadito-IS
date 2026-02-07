"use client"

import { useEffect, useState } from "react"
import type { User } from "@/types/database"
import { getUsers, updateUserStatus } from "@/app/actions"
import { CITIES } from "@/lib/constants"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Ban, Search, CheckCircle, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [cityFilter, setCityFilter] = useState<string>("all")

    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    // MOCK DATA aligned with new User type
    const MOCK_USERS: User[] = [
        {
            id: "u1",
            created_at: "2024-01-15T10:00:00Z",
            email: "alice.merchant@example.com",
            full_name: "Alice Marchand",
            city: "N'Djamena",
            is_verified: true,
            account_type: 'merchant',
            avatar_url: '',
            nni_number: '123456789'
        },
        {
            id: "u2",
            created_at: "2024-02-20T14:30:00Z",
            email: "bob.standard@example.com",
            full_name: "Bob Standard",
            city: "Moundou",
            is_verified: false,
            account_type: 'standard',
            avatar_url: '',
            nni_number: ''
        },
        {
            id: "u3",
            created_at: "2024-03-05T09:15:00Z",
            email: "charlie.verified@example.com",
            full_name: "Charlie Vérifié",
            city: "Abéché",
            is_verified: true,
            account_type: 'standard',
            avatar_url: '',
            nni_number: '987654321'
        }
    ]

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const data = await getUsers()
            if (data && data.length > 0) {
                setUsers(data)
            } else {
                // Keep mocks if empty for demo purposes, or set empty
                // Checks if we are in a purely empty state or mock state
                // For this user context, if empty, we might show mocks or just empty.
                // Resetting to empty if real data fetch returns nothing/empty array
                setUsers(data)
            }
        } catch (err) {
            console.error("Exception fetching users:", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    // Filtering Logic
    useEffect(() => {
        let result = users

        // 1. Search (Name or Email)
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase()
            result = result.filter(u =>
                (u.email?.toLowerCase().includes(lowerQuery)) ||
                (u.full_name?.toLowerCase().includes(lowerQuery))
            )
        }

        // 2. Status Filter (Verified)
        if (statusFilter !== 'all') {
            if (statusFilter === 'verified') {
                result = result.filter(u => u.is_verified === true)
            } else if (statusFilter === 'unverified') {
                result = result.filter(u => u.is_verified === false)
            }
        }

        // 3. City Filter
        if (cityFilter !== 'all') {
            result = result.filter(u => u.city === cityFilter)
        }

        setFilteredUsers(result)
    }, [searchQuery, statusFilter, cityFilter, users])


    const handleOpenDetails = (user: User) => {
        setSelectedUser(user)
        setIsDialogOpen(true)
    }

    const handleBanUser = async () => {
        if (!selectedUser) return
        if (!confirm(`Êtes-vous sûr de vouloir bannir ${selectedUser.full_name} ?`)) return

        setActionLoading(true)
        try {
            // Ban logic via server action could be mapped here if we add 'status' field.
            // For now just console log as per previous logic, or update if field exists.
            // Assuming we want to block them:
            // await updateUserStatus(selectedUser.id, { status: 'banned' }) 
            alert("Action simulée (Bannissement)")
            setIsDialogOpen(false)
        } finally {
            setActionLoading(false)
        }
    }

    const getAccountTypeBadge = (type: string) => {
        return type === 'merchant'
            ? <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Marchand</Badge>
            : <Badge variant="secondary" className="bg-gray-100 text-gray-700">Standard</Badge>
    }

    const getVerificationBadge = (isVerified: boolean) => {
        return isVerified
            ? <Badge className="bg-green-600 hover:bg-green-700 gap-1"><CheckCircle className="h-3 w-3" /> Vérifié</Badge>
            : <Badge variant="outline" className="text-muted-foreground">Non vérifié</Badge>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h2>
                    <p className="text-muted-foreground">{filteredUsers.length} comptes enregistrés</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par nom ou email..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-[200px]">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Statut Vérification" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="verified">Vérifiés Uniquement</SelectItem>
                            <SelectItem value="unverified">Non Vérifiés</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-full md:w-[200px]">
                    <Select value={cityFilter} onValueChange={setCityFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrer par Ville" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les villes</SelectItem>
                            {CITIES.map((city) => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Type de Compte</TableHead>
                            <TableHead>Ville</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Date création</TableHead>
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
                                            <span className="font-medium">{user.full_name}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getAccountTypeBadge(user.account_type)}
                                    </TableCell>
                                    <TableCell>{user.city || '-'}</TableCell>
                                    <TableCell>
                                        {getVerificationBadge(user.is_verified)}
                                    </TableCell>
                                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
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

            {/* User Details Modal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Fiche Utilisateur</DialogTitle>
                        <DialogDescription>ID: {selectedUser?.id}</DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="grid gap-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500 uppercase">
                                    {selectedUser.full_name.substring(0, 2)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{selectedUser.full_name}</h3>
                                    <p className="text-muted-foreground">{selectedUser.email}</p>
                                    <div className="flex gap-2 mt-1">
                                        {getAccountTypeBadge(selectedUser.account_type)}
                                        {getVerificationBadge(selectedUser.is_verified)}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                                <div>
                                    <span className="font-semibold text-muted-foreground block mb-1">Ville</span>
                                    {selectedUser.city || 'Non renseigné'}
                                </div>
                                <div>
                                    <span className="font-semibold text-muted-foreground block mb-1">Numéro NNI</span>
                                    {selectedUser.nni_number || 'Non renseigné'}
                                </div>
                                <div>
                                    <span className="font-semibold text-muted-foreground block mb-1">Date d'inscription</span>
                                    {new Date(selectedUser.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="destructive"
                            onClick={handleBanUser}
                            disabled={actionLoading}
                            className="w-full sm:w-auto"
                        >
                            <Ban className="mr-2 h-4 w-4" />
                            Bloquer l'utilisateur
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
