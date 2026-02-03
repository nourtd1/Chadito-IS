'use server'

import { supabaseAdmin } from "@/lib/supabase"
import type { User, ReportJoined } from "@/types/database"

export async function getUsers() {
    try {
        // @ts-ignore
        if (supabaseAdmin['isMockClient']) return []

        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error("Server Action Users Error:", error)
            return []
        }
        return data as User[]
    } catch (e) {
        console.error("Server Action Users Exception:", e)
        return []
    }
}

export async function getPendingVerifications() {
    try {
        // @ts-ignore
        if (supabaseAdmin['isMockClient']) return []

        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('is_verified', false)
            .not('nni_document_path', 'is', null)

        if (error) throw error
        return data as User[]
    } catch (e) {
        console.error("Server Action Pending Verifications Error:", e)
        return []
    }
}

export async function getDashboardStats() {
    // @ts-ignore
    if (supabaseAdmin['isMockClient']) return null

    try {
        const { count: usersCount } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true })

        const { count: merchantsCount } = await supabaseAdmin
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('account_type', 'merchant')
            .eq('is_verified', true)

        const { count: listingsCount } = await supabaseAdmin.from('listings').select('*', { count: 'exact', head: true })

        const { count: reportsCount } = await supabaseAdmin
            .from('reports')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending')

        return {
            totalUsers: usersCount || 0,
            verifiedMerchants: merchantsCount || 0,
            totalListings: listingsCount || 0,
            pendingReports: reportsCount || 0,
        }
    } catch (e) {
        console.error(e)
        return null
    }
}

export async function getReports() {
    // @ts-ignore
    if (supabaseAdmin['isMockClient']) return []
    try {
        const { data, error } = await supabaseAdmin
            .from('reports')
            .select('*, listing:listings(title, images), reporter:users(email)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as unknown as ReportJoined[]
    } catch (e) {
        console.error(e)
        return []
    }
}

// Server Actions for Mutations

export async function updateUserStatus(userId: string, updates: Partial<User>) {
    try {
        const { error } = await supabaseAdmin.from('users').update(updates).eq('id', userId)
        if (error) throw error
        return { success: true }
    } catch (e) {
        console.error(e)
        return { success: false, error: e }
    }
}

export async function resolveReport(reportId: string, listingId?: string, action: 'dismiss' | 'delete_listing') {
    try {
        if (action === 'dismiss') {
            await supabaseAdmin.from('reports').update({ status: 'dismissed' }).eq('id', reportId)
        } else if (action === 'delete_listing' && listingId) {
            await supabaseAdmin.from('listings').delete().eq('id', listingId)
            await supabaseAdmin.from('reports').update({ status: 'resolved' }).eq('id', reportId)
        }
        return { success: true }
    } catch (e) {
        console.error(e)
        return { success: false, error: e }
    }
}

export async function getSignedDocUrl(path: string) {
    try {
        const { data, error } = await supabaseAdmin
            .storage
            .from('documents')
            .createSignedUrl(path, 60)

        if (error) throw error
        return data?.signedUrl
    } catch (e) {
        console.error(e)
        return null
    }
}
