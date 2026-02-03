"use client"

import { useEffect, useState } from "react"
import { supabaseAdmin } from "@/lib/supabase"
import type { ReportJoined } from "@/types/database"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertOctagon, Eye, Trash2, CheckCircle, ShieldAlert } from "lucide-react"

export default function ReportsPage() {
    const [reports, setReports] = useState<ReportJoined[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedReport, setSelectedReport] = useState<ReportJoined | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    // MOCK DATA
    const MOCK_REPORTS: ReportJoined[] = [
        {
            id: "r1",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            reason: "Arnaque suspectée",
            status: "pending",
            listing_id: "l1",
            reported_by: "u2",
            listing: {
                title: "iPhone 15 Pro Max pas cher",
                images: ["https://placehold.co/600x400"]
            },
            reporter: {
                email: "vigilant@example.com"
            }
        },
        {
            id: "r2",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            reason: "Contenu inapproprié",
            status: "pending",
            listing_id: "l2",
            reported_by: "u3",
            listing: {
                title: "Service douteux",
                images: ["https://placehold.co/600x400"]
            },
            reporter: {
                email: "citizen@example.com"
            }
        }
    ]

    const fetchReports = async () => {
        setIsLoading(true)

        // @ts-ignore
        if (supabaseAdmin['isMockClient'] || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
            setReports(MOCK_REPORTS)
            setIsLoading(false)
            return
        }

        try {
            // Updated query using real table relationships: reports -> listings, reports -> users (as reporter)
            const { data, error } = await supabaseAdmin
                .from('reports')
                .select('*, listing:listings(title, images), reporter:users(email)')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })

            if (error || !data) {
                console.error("Error fetching reports:", error)
                setReports(MOCK_REPORTS)
            } else {
                setReports(data as unknown as ReportJoined[])
            }
        } catch (err) {
            console.error("Exception fetching reports:", err)
            setReports(MOCK_REPORTS)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchReports()
    }, [])

    const handleOpenReview = (report: ReportJoined) => {
        setSelectedReport(report)
        setIsDialogOpen(true)
    }

    const handleDismiss = async () => {
        if (!selectedReport) return
        setActionLoading(true)
        try {
            await supabaseAdmin.from('reports').update({ status: 'dismissed' }).eq('id', selectedReport.id)
            setReports(reports.filter(r => r.id !== selectedReport.id))
            setIsDialogOpen(false)
        } catch (e) {
            console.error(e)
            alert("Erreur lors de l'action.")
        } finally {
            setActionLoading(false)
        }
    }

    const handleDeleteListing = async () => {
        if (!selectedReport) return
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) return

        setActionLoading(true)
        try {
            // 1. Delete from listings table
            const { error: deleteError } = await supabaseAdmin.from('listings').delete().eq('id', selectedReport.listing_id)
            if (deleteError) throw deleteError

            // 2. Mark report as resolved
            await supabaseAdmin.from('reports').update({ status: 'resolved' }).eq('id', selectedReport.id)

            setReports(reports.filter(r => r.id !== selectedReport.id))
            setIsDialogOpen(false)
        } catch (e) {
            console.error(e)
            alert("Erreur lors de la suppression de l'annonce.")
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Signalements</h2>
                <Badge variant="outline" className="text-sm py-1 px-3">
                    {reports.length} en attente
                </Badge>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Motif</TableHead>
                            <TableHead>Annonce</TableHead>
                            <TableHead>Signalé par</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">Chargement...</TableCell>
                            </TableRow>
                        ) : reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Aucun signalement en attente.</TableCell>
                            </TableRow>
                        ) : (
                            reports.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell className="font-medium">
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="destructive" className="bg-orange-600 hover:bg-orange-700">
                                            {report.reason}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {report.listing ? (
                                            <span className="font-semibold">{report.listing.title}</span>
                                        ) : (
                                            <span className="italic text-muted-foreground">Annonce supprimée</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {report.reporter?.email || 'Anonyme'}
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
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertOctagon className="h-5 w-5 text-destructive" />
                            Détail du Signalement
                        </DialogTitle>
                        <DialogDescription>
                            Signalement ID: {selectedReport?.id}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReport && (
                        <div className="space-y-4">
                            <div className="bg-muted p-3 rounded text-sm">
                                <span className="font-bold block text-foreground mb-1">Motif : {selectedReport.reason}</span>
                                <p className="text-muted-foreground">Signalé le {new Date(selectedReport.created_at).toLocaleString()}</p>
                            </div>

                            {selectedReport.listing && (
                                <div className="border rounded p-3">
                                    <h4 className="font-semibold mb-2">Annonce Concernée</h4>
                                    <div className="flex gap-3">
                                        {selectedReport.listing.images && selectedReport.listing.images[0] && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={selectedReport.listing.images[0]}
                                                alt="Aperçu"
                                                className="w-20 h-20 object-cover rounded bg-slate-200"
                                            />
                                        )}
                                        <div>
                                            <p className="font-medium">{selectedReport.listing.title}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50 mr-auto"
                            onClick={handleDismiss}
                            disabled={actionLoading}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Ignorer (Non Fondé)
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={handleDeleteListing}
                            disabled={actionLoading}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer l'Annonce
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
