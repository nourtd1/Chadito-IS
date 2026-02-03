"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { supabaseAdmin } from "@/lib/supabase"
import { Users, CheckCircle, ShoppingBag, AlertCircle, Download, TrendingUp, MapPin, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts"

// Couleurs pour les graphiques
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedMerchants: 0,
    totalListings: 0,
    pendingReports: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Données pour les graphiques (Mockés pour l'instant car nécessitent des agrégations complexes)
  const [registrationsData, setRegistrationsData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [cityData, setCityData] = useState<any[]>([])

  const generateMockData = () => {
    // Évolution inscriptions
    const mockRegistrations = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return {
        date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        value: Math.floor(Math.random() * 10) + 1
      }
    })

    // Répartition
    const mockCategories = [
      { name: 'Auto', value: 35 },
      { name: 'Téléphones', value: 40 },
      { name: 'Immobilier', value: 10 },
      { name: 'Services', value: 15 },
    ]

    const mockCities = [
      { name: "N'Djamena", value: 150 },
      { name: 'Moundou', value: 40 },
      { name: 'Abéché', value: 25 },
    ]

    setRegistrationsData(mockRegistrations)
    setCategoryData(mockCategories)
    setCityData(mockCities)
  }

  const fetchDashboardData = async () => {
    setIsLoading(true)
    generateMockData() // Charts always mocked for now

    // @ts-ignore
    if (supabaseAdmin['isMockClient'] || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setStats({
        totalUsers: 150,
        verifiedMerchants: 45,
        totalListings: 320,
        pendingReports: 5
      })
      setIsLoading(false)
      return
    }

    try {
      // 1. Total Users
      const { count: usersCount } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true })

      // 2. Vendeurs Vérifiés (account_type = 'merchant' AND is_verified = true)
      const { count: merchantsCount } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('account_type', 'merchant')
        .eq('is_verified', true)

      // 3. Total Listings
      const { count: listingsCount } = await supabaseAdmin.from('listings').select('*', { count: 'exact', head: true })

      // 4. Signalements en attente (status = 'pending')
      const { count: reportsCount } = await supabaseAdmin
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      setStats({
        totalUsers: usersCount || 0,
        verifiedMerchants: merchantsCount || 0,
        totalListings: listingsCount || 0,
        pendingReports: reportsCount || 0,
      })

    } catch (e) {
      console.error("Dashboard fetch error:", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tableau de Bord</h2>
          <p className="text-muted-foreground">Vue d'ensemble de l'activité sur Chadito IS</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Inscrits sur la plateforme</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendeurs Vérifiés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedMerchants}</div>
            <p className="text-xs text-muted-foreground">Comptes marchands validés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Annonces</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            <p className="text-xs text-muted-foreground">En ligne ou vendues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signalements</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReports}</div>
            <p className="text-xs text-muted-foreground">En attente de modération</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Line Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Inscriptions (30 Jours)
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrationsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#888' }} minTickGap={30} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Répartition par Catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart - Villes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Top Villes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 13 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" fill="#0f172a" radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
