"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, FileCheck, AlertOctagon, LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import { getCurrentRole, logout } from "@/lib/auth"
import type { UserRole } from "@/types/roles"
import { ROLE_LABELS } from "@/types/roles"
import { Button } from "@/components/ui/button"

export function Sidebar() {
    const pathname = usePathname()
    const [role, setRole] = useState<UserRole | null>(null)
    // Utiliser un état pour éviter les mismatches d'hydratation
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setRole(getCurrentRole())
        setMounted(true)
    }, [])

    if (!mounted) return <div className="w-64 border-r bg-card" /> // Placeholder loading

    const allLinks = [
        {
            name: 'Tableau de bord',
            href: '/',
            icon: LayoutDashboard,
            roles: ['super_admin', 'moderator_docs', 'moderator_ads', 'analyst']
        },
        {
            name: 'Utilisateurs',
            href: '/users',
            icon: Users,
            roles: ['super_admin']
        },
        {
            name: 'Vérifications',
            href: '/verifications',
            icon: FileCheck,
            roles: ['super_admin', 'moderator_docs']
        },
        {
            name: 'Signalements',
            href: '/reports',
            icon: AlertOctagon,
            roles: ['super_admin', 'moderator_ads']
        },
    ]

    const allowedLinks = allLinks.filter(link => role && link.roles.includes(role))

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card text-card-foreground">
            <div className="flex h-16 items-center gap-2 border-b px-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="h-8 w-8 overflow-hidden rounded-full">
                    <img src="/logo.jpeg" alt="Logo" className="h-full w-full object-cover scale-150" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">Chadito IS</h1>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {allowedLinks.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                }`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
            <div className="border-t p-4 space-y-4">
                <div className="px-3 py-2 text-sm">
                    <p className="text-muted-foreground text-xs uppercase font-semibold">Connecté en tant que</p>
                    <p className="font-medium truncate">{role ? ROLE_LABELS[role] : '...'}</p>
                </div>
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => logout()}
                >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                </Button>
            </div>
        </div>
    )
}
