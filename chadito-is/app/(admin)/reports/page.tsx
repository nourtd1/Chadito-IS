"use client"

import { useEffect, useState } from "react"
import { supabaseAdmin } from "@/lib/supabase"
import type { Report, Product } from "@/types/report"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertOctagon, Eye, Trash2, ShieldOff, CheckCircle, Loader2, AlertTriangle } from "lucide-react"

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedReport, setSelectedReport] = useState<Report | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    // MOCK DATA
    const MOCK_REPORTS: Report[] = [
        {
            id: "r1",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            reason: "scam",
            status: "pending",
            product_id: "p1",
            reporter_id: "u2",
            description: "Le prix est trop beau pour être vrai, demande virement western union.",
            product: {
                id: "p1",
                title: "iPhone 15 Pro Max Neuf",
                description: "Vends iPhone 15 Pro Max tout neuf sous blister. Prix ferme 200€. Contactez uniquement par mail.",
                price: 200,
                image_url: "https://placehold.co/600x400/png?text=iPhone+Fake",
                seller_id: "s1",
                seller_name: "VendeurLouche123"
            }
        },
        {
            id: "r2",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            reason: "inappropriate",
            status: "pending",
            product_id: "p2",
            reporter_id: "u3",
            product: {
                id: "p2",
                title: "Service de massage",
                description: "Services spéciaux...",
                price: 50,
                image_url: "https://placehold.co/600x400/png?text=Service",
                seller_id: "s2",
                seller_name: "UserAnon"
            }
        },
        {
            id: "r3",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            reason: "spam",
            status: "pending",
            product_id: "p3",
            reporter_id: "u4",
            product: {
                id: "p3",
                title: "Gagnez de l'argent facile",
                description: "Cliquez ici pour devenir riche.",
                price: 0,
                image_url: "https://placehold.co/600x400/png?text=Spam",
                seller_id: "s3",
                seller_name: "BotSpam"
            }
        }
    ]

    const fetchReports = async () => {
        setIsLoading(true)
        try {
            // Simulation de la récupération avec jointure
            // En prod : .select('*, product:products(*)')
            const { data, error } = await supabaseAdmin
                .from('reports')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })

            if (error || !data || data.length === 0) {
                // Fallback mock
                setReports(MOCK_REPORTS)
            } else {
                setReports(data)
            }
        } catch (err) {
            setReports(MOCK_REPORTS)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchReports()
    }, [])

    const handleOpenReview = (report: Report) => {
        setSelectedReport(report)
        setIsDialogOpen(true)
    }

    const handleDismiss = async () => {
        if (!selectedReport) return
        setActionLoading(true)
        try {
            // Marquer comme traité/ignoré
            await supabaseAdmin.from('reports').update({ status: 'dismissed' }).eq('id', selectedReport.id)

            // Update UI
            setReports(reports.filter(r => r.id !== selectedReport.id))
            setIsDialogOpen(false)
        } finally {
            setActionLoading(false)
        }
    }

    const handleDeleteAd = async () => {
        if (!selectedReport?.product) return
        if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement cette annonce ?")) return

        setActionLoading(true)
        try {
            // 1. Supprimer le produit
            await supabaseAdmin.from('products').delete().eq('id', selectedReport.product.id)
            // 2. Marquer le signalement comme résolu
            await supabaseAdmin.from('reports').update({ status: 'resolved' }).eq('id', selectedReport.id)

            // Update UI
            setReports(reports.filter(r => r.id !== selectedReport.id))
            setIsDialogOpen(false)
        } catch (e) {
            console.error(e)
            alert("Erreur lors de la suppression")
        } finally {
            setActionLoading(false)
        }
    }

    const handleSuspendSeller = async () => {
        if (!selectedReport?.product) return
        if (!confirm(`Voulez-vous vraiment suspendre le compte de ${selectedReport.product.seller_name} ?`)) return

        setActionLoading(true)
        try {
            // Suspendre l'utilisateur
            await supabaseAdmin.from('profiles').update({ status: 'suspended' }).eq('id', selectedReport.product.seller_id)

            // Optionnel : Supprimer ses annonces ou marquer le report résolu
            await supabaseAdmin.from('reports').update({ status: 'resolved' }).eq('id', selectedReport.id)

            setReports(reports.filter(r => r.id !== selectedReport.id))
            setIsDialogOpen(false)
        } catch (e) {
            console.error(e)
            alert("Erreur lors de la suspension")
        } finally {
            setActionLoading(false)
        }
    }

    const getReasonBadge = (reason: string) => {
        switch (reason) {
            case 'scam': return <Badge variant="destructive">Arnaque</Badge>
            case 'inappropriate': return <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">Inapproprié</Badge>
            case 'spam': return <Badge variant="secondary">Spam</Badge>
            default: return <Badge variant="outline">{reason}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Signalements & Modération</h2>
                <Badge variant="outline" className="text-sm py-1 px-3">
                    {reports.length} à traiter
                </Badge>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Motif</TableHead>
                            <TableHead>Annonce Concernée</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Chargement...
                                </TableCell>
                            </TableRow>
                        ) : reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    Aucun signalement en attente.
                                </TableCell>
                            </TableRow>
                        ) : (
                            reports.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell className="font-medium">
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {getReasonBadge(report.reason)}
                                    </TableCell>
                                    <TableCell>
                                        {report.product ? (
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{report.product.title}</span>
                                                <span className="text-xs text-muted-foreground">par {report.product.seller_name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground italic">Annonce introuvable</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="outline" onClick={() => handleOpenReview(report)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Examiner
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertOctagon className="h-5 w-5 text-destructive" />
                            Détail du signalement
                        </DialogTitle>
                        <DialogDescription>
                            Signalé le {selectedReport && new Date(selectedReport.created_at).toLocaleDateString()} pour motif :
                            <span className="font-semibold ml-1">{selectedReport?.reason}</span>
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReport?.description && (
                        <div className="bg-muted p-3 rounded-md text-sm border-l-4 border-yellow-500">
                            <span className="font-semibold block mb-1">Commentaire du signalement :</span>
                            "{selectedReport.description}"
                        </div>
                    )}

                    {selectedReport?.product && (
                        <div className="grid md:grid-cols-2 gap-6 border rounded-lg p-4 mt-2">
                            <div className="aspect-video bg-muted rounded-md overflow-hidden relative flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={selectedReport.product.image_url}
                                    alt={selectedReport.product.title}
                                    className="object-cover w-full h-full"
                                />
                                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-bold">
                                    {selectedReport.product.price} €
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold">{selectedReport.product.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Vendu par <span className="font-medium text-foreground">{selectedReport.product.seller_name}</span>
                                    </p>
                                </div>
                                <div className="h-32 overflow-y-auto border rounded p-2 text-sm bg-muted/20">
                                    {selectedReport.product.description}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-2 flex-wrap">
                        <Button
                            variant="outline"
                            className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                            onClick={handleDismiss}
                            disabled={actionLoading}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Ignorer (Sans suite)
                        </Button>

                        <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={handleDeleteAd}
                            disabled={actionLoading}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer l'annonce
                        </Button>

                        <Button
                            variant="destructive"
                            className="flex-1 bg-black hover:bg-gray-800"
                            onClick={handleSuspendSeller}
                            disabled={actionLoading}
                        >
                            <ShieldOff className="mr-2 h-4 w-4" />
                            Suspendre Vendeur
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
