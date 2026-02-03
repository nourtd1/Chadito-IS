"use client"

import { useEffect, useState } from "react"
import type { User } from "@/types/database"
import { getPendingVerifications, updateUserStatus, getSignedDocUrl } from "@/app/actions"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Check, X, Loader2, Eye, AlertTriangle } from "lucide-react"

export default function VerificationsPage() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [rejectionReason, setRejectionReason] = useState("")
    const [actionLoading, setActionLoading] = useState(false)

    // Signed URL state
    const [signedDocumentUrl, setSignedDocumentUrl] = useState<string | null>(null)
    const [isImageLoading, setIsImageLoading] = useState(false)

    // Simulation DATA aligned with User type
    const MOCK_USERS: User[] = [
        {
            id: "1",
            created_at: new Date().toISOString(),
            email: "jean.merchant@example.com",
            full_name: "Jean Dupont",
            is_verified: false,
            nni_number: "123456",
            nni_document_path: "mock/path/id_card.png",
            account_type: 'standard', // Applied for merchant
            avatar_url: '',
            city: "N'Djamena"
        },
        {
            id: "2",
            created_at: new Date().toISOString(),
            email: "marie.curie@example.com",
            full_name: "Marie Curie",
            is_verified: false,
            nni_number: "987654",
            nni_document_path: "mock/path/passport.png",
            account_type: 'standard',
            avatar_url: '',
            city: "Moundou"
        }
    ]

    const fetchPendingVerifications = async () => {
        setIsLoading(true)
        try {
            const data = await getPendingVerifications()
            if (data && data.length > 0) {
                setUsers(data)
            } else {
                // Fallback to mocks only if completely empty and env mandates it? 
                // For now, if empty, we trust it's empty.
                setUsers([])
            }
        } catch (err) {
            console.error('Unexpected error:', err)
            setUsers([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPendingVerifications()
    }, [])

    const handleOpenReview = async (user: User) => {
        setSelectedUser(user)
        setRejectionReason("")
        setSignedDocumentUrl(null)
        setIsDialogOpen(true)

        // Fetch signed URL if path exists
        if (user.nni_document_path) {
            setIsImageLoading(true)
            try {
                const url = await getSignedDocUrl(user.nni_document_path)
                if (url) {
                    setSignedDocumentUrl(url)
                } else {
                    // Fallback mock check handled in action? No, action returns null if fails.
                    // Client side fallback for demo if needed
                    const isMock = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
                    if (isMock) {
                        setSignedDocumentUrl("https://placehold.co/600x400/png?text=Document+Securise")
                    }
                }
            } catch (e) {
                console.error("Error signing url:", e)
            } finally {
                setIsImageLoading(false)
            }
        }
    }

    const handleAccept = async () => {
        if (!selectedUser) return
        setActionLoading(true)
        try {
            const { success } = await updateUserStatus(selectedUser.id, {
                is_verified: true,
                account_type: 'merchant'
            })

            if (!success) throw new Error("Update failed")

            setUsers(users.filter(u => u.id !== selectedUser.id))
            setIsDialogOpen(false)
        } catch (error) {
            console.error('Error verifying user:', error)
            alert("Erreur lors de la validation.")
        } finally {
            setActionLoading(false)
        }
    }

    const handleReject = async () => {
        if (!selectedUser) return
        if (!rejectionReason.trim()) {
            alert("Le motif de rejet est obligatoire.")
            return
        }

        setActionLoading(true)
        try {
            // Logic handled purely client side for now as per previous implementation (logging) 
            // since we don't have a status field for rejection.
            console.log(`Rejected user ${selectedUser.id} for reason: ${rejectionReason}`)

            setUsers(users.filter(u => u.id !== selectedUser.id))
            setIsDialogOpen(false)
        } catch (error) {
            console.error('Error rejecting user:', error)
            alert("Erreur lors du rejet.")
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Validation des Vendeurs</h2>
                <Badge variant="outline" className="text-sm py-1 px-3">
                    {users.length} en attente
                </Badge>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : users.length === 0 ? (
                <Card className="bg-muted/50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                        <Check className="h-12 w-12 mb-4 text-green-500" />
                        <p className="text-lg font-medium">Aucune demande en attente</p>
                        <p className="text-sm">Tous les dossiers ont été traités.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {users.map((user) => (
                        <Card key={user.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleOpenReview(user)}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-semibold">
                                            {user.full_name}
                                        </CardTitle>
                                        <CardDescription>{user.email}</CardDescription>
                                    </div>
                                    <Badge className="bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/50">
                                        En attente
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                <p>Candidature reçue le : {new Date(user.created_at).toLocaleDateString()}</p>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <Button variant="secondary" className="w-full text-xs h-8">
                                    <Eye className="mr-2 h-3 w-3" /> Examiner le dossier
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* MODALE DE VÉRIFICATION */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Examen du dossier</DialogTitle>
                        <DialogDescription>
                            Vérifiez l'identité du candidat vendeur.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Nom Complet</Label>
                                    <div className="font-medium border rounded-md p-2 bg-muted/20">{selectedUser.full_name}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label>Numéro NNI</Label>
                                    <div className="font-medium border rounded-md p-2 bg-muted/20">{selectedUser.nni_number || 'Non renseigné'}</div>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <Label>Email</Label>
                                    <div className="font-medium border rounded-md p-2 bg-muted/20">{selectedUser.email}</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Pièce d'identité (Sécurisée)</Label>
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
                                    {isImageLoading ? (
                                        <div className="flex flex-col items-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                                            <span className="text-xs text-muted-foreground">Génération du lien sécurisé...</span>
                                        </div>
                                    ) : signedDocumentUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={signedDocumentUrl}
                                            alt="Document NNI"
                                            className="object-contain w-full h-full"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-muted-foreground">
                                            <AlertTriangle className="h-8 w-8 mb-2" />
                                            <p>Document inaccessible ou manquant</p>
                                        </div>
                                    )}
                                </div>
                                {selectedUser.nni_document_path && !isImageLoading && signedDocumentUrl && (
                                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                        <Check className="h-3 w-3" /> Lien signé temporaire généré (valide 60s)
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rejectReason" className="text-destructive font-medium">
                                    Motif de rejet (Si applicable)
                                </Label>
                                <Textarea
                                    id="rejectReason"
                                    placeholder="Expliquez pourquoi le dossier est rejeté..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="resize-none"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={actionLoading}
                            className="sm:order-1"
                        >
                            {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                            Rejeter
                        </Button>
                        <Button
                            onClick={handleAccept}
                            disabled={actionLoading}
                            className="bg-green-600 hover:bg-green-700 text-white sm:order-2"
                        >
                            {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                            Accepter & Passer Marchand
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
