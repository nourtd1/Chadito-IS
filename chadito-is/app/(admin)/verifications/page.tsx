"use client"

import { useEffect, useState } from "react"
import { supabaseAdmin } from "@/lib/supabase"
import type { Profile } from "@/types/profile"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Check, X, Loader2, Eye, AlertTriangle } from "lucide-react"

export default function VerificationsPage() {
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [rejectionReason, setRejectionReason] = useState("")
    const [actionLoading, setActionLoading] = useState(false)

    // Simulation DATA pour le développement si Supabase est vide
    // NOTE: En prod, retirer ce mock et utiliser seulement fetchProfiles
    const MOCK_PROFILES: Profile[] = [
        {
            id: "1",
            created_at: new Date().toISOString(),
            email: "jean.dupont@example.com",
            first_name: "Jean",
            last_name: "Dupont",
            verification_status: 'pending',
            id_card_url: "https://placehold.co/600x400/png?text=Carte+Identite"
        },
        {
            id: "2",
            created_at: new Date().toISOString(),
            email: "marie.curie@example.com",
            first_name: "Marie",
            last_name: "Curie",
            verification_status: 'pending',
            id_card_url: "https://placehold.co/600x400/png?text=Passeport+Marie"
        }
    ]

    const fetchProfiles = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .eq('verification_status', 'pending')

            if (error) {
                console.error('Error fetching profiles:', error)
                // Fallback mock si la table n'existe pas ou erreur
                setProfiles(MOCK_PROFILES)
            } else {
                // Envisager de mixer avec les mocks si data est vide pour la démo
                setProfiles(data && data.length > 0 ? data : MOCK_PROFILES)
            }
        } catch (err) {
            console.error('Unexpected error:', err)
            setProfiles(MOCK_PROFILES)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProfiles()
    }, [])

    const handleOpenReview = (profile: Profile) => {
        setSelectedProfile(profile)
        setRejectionReason("")
        setIsDialogOpen(true)
    }

    const handleVerify = async () => {
        if (!selectedProfile) return
        setActionLoading(true)
        try {
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({ verification_status: 'verified', verification_rejection_reason: null })
                .eq('id', selectedProfile.id)

            if (error) throw error

            // Update UI local state
            setProfiles(profiles.filter(p => p.id !== selectedProfile.id))
            setIsDialogOpen(false)
        } catch (error) {
            console.error('Error verifying profile:', error)
            alert("Erreur lors de la validation. Vérifiez la console.")
        } finally {
            setActionLoading(false)
        }
    }

    const handleReject = async () => {
        if (!selectedProfile) return
        if (!rejectionReason.trim()) {
            alert("Le motif de rejet est obligatoire.")
            return
        }

        setActionLoading(true)
        try {
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({
                    verification_status: 'rejected',
                    verification_rejection_reason: rejectionReason
                })
                .eq('id', selectedProfile.id)

            if (error) throw error

            // Update UI local state
            setProfiles(profiles.filter(p => p.id !== selectedProfile.id))
            setIsDialogOpen(false)
        } catch (error) {
            console.error('Error rejecting profile:', error)
            alert("Erreur lors du rejet. Vérifiez la console.")
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Vérifications d'identité (KYC)</h2>
                <Badge variant="outline" className="text-sm py-1 px-3">
                    {profiles.length} en attente
                </Badge>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : profiles.length === 0 ? (
                <Card className="bg-muted/50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                        <Check className="h-12 w-12 mb-4 text-green-500" />
                        <p className="text-lg font-medium">Aucune demande en attente</p>
                        <p className="text-sm">Bon travail ! Tous les dossiers ont été traités.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {profiles.map((profile) => (
                        <Card key={profile.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleOpenReview(profile)}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-semibold">
                                            {profile.first_name} {profile.last_name}
                                        </CardTitle>
                                        <CardDescription>{profile.email}</CardDescription>
                                    </div>
                                    <Badge className="bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/25 border-yellow-500/50">
                                        En attente
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                <p>Demandé le : {new Date(profile.created_at).toLocaleDateString()}</p>
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
                            Vérifiez la concordance entre les informations et la pièce d'identité.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedProfile && (
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Prénom</Label>
                                    <div className="font-medium border rounded-md p-2 bg-muted/20">{selectedProfile.first_name || '-'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label>Nom</Label>
                                    <div className="font-medium border rounded-md p-2 bg-muted/20">{selectedProfile.last_name || '-'}</div>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <Label>Email</Label>
                                    <div className="font-medium border rounded-md p-2 bg-muted/20">{selectedProfile.email}</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Pièce d'identité fournie</Label>
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
                                    {selectedProfile.id_card_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={selectedProfile.id_card_url}
                                            alt="Pièce d'identité"
                                            className="object-contain w-full h-full"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-muted-foreground">
                                            <AlertTriangle className="h-8 w-8 mb-2" />
                                            <p>Aucun document chargé</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rejectReason" className="text-destructive font-medium">
                                    Motif de rejet (obligatoire en cas de refus)
                                </Label>
                                <Textarea
                                    id="rejectReason"
                                    placeholder="Ex: Document illisible, nom ne correspond pas, document expiré..."
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
                            onClick={handleVerify}
                            disabled={actionLoading}
                            className="bg-green-600 hover:bg-green-700 text-white sm:order-2"
                        >
                            {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                            Approuver / Vérifier
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
