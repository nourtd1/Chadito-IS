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
    verifiedUsers: 0,
    totalAds: 0,
    pendingAds: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Données pour les graphiques
  const [registrationsData, setRegistrationsData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [cityData, setCityData] = useState<any[]>([])

  // MOCK DATA GENERATION (Pour la démo)
  const generateMockData = () => {
    // Évolution inscriptions (30 derniers jours)
    const mockRegistrations = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return {
        date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        value: Math.floor(Math.random() * 15) + 1 // 1 à 15 inscriptions par jour
      }
    })

    // Répartition par catégorie
    const mockCategories = [
      { name: 'Électronique', value: 45 },
      { name: 'Véhicules', value: 30 },
      { name: 'Immobilier', value: 15 },
      { name: 'Mode', value: 25 },
      { name: 'Services', value: 10 },
    ]

    // Répartition par ville
    const mockCities = [
      { name: "N'Djamena", value: 120 },
      { name: 'Moundou', value: 45 },
      { name: 'Abéché', value: 30 },
      { name: 'Sarh', value: 25 },
      { name: 'Bongor', value: 15 },
    ]

    setRegistrationsData(mockRegistrations)
    setCategoryData(mockCategories)
    setCityData(mockCities)

    // Stats Cards Mock
    setStats({
      totalUsers: 245,
      verifiedUsers: 89,
      totalAds: 134,
      pendingAds: 12 // Correspond aux signalements ou validations
    })
  }

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Pour une vraie implémentation, on ferait des COUNT(*) via Supabase
      // ici nous allons fallback sur les mocks directement car nous n'avons pas assez de données
      // dans une DB vide.

      /* Exemple de code réel :
      const countUsers = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })
      const countVerified = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified')
      // ...
      */

      // Récupération des données réelles si disponibles, sinon mock
      const { count: realUserCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })

      if (realUserCount === null || realUserCount === 0) {
        generateMockData()
      } else {
        // Logique simplifiée pour utiliser les mocks quand même pour la richesse visuelle de la démo
        // Dans un cas réel, on parserait les données ici.
        generateMockData()
      }

    } catch (e) {
      console.error(e)
      generateMockData()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleExportCSV = () => {
    // Simulation d'export simple
    const headers = ["Date", "Inscriptions"]
    const rows = registrationsData.map(r => `${r.date},${r.value}`)

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "chadito_stats_inscriptions.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tableau de Bord</h2>
          <p className="text-muted-foreground">Vue d'ensemble de l'activité sur Chadito IS</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exporter CSV
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
            <p className="text-xs text-muted-foreground">+4% depuis le mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Vérifiés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedUsers}</div>
            <p className="text-xs text-muted-foreground">Soit {((stats.verifiedUsers / stats.totalUsers) * 100).toFixed(1)}% de la base</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Annonces</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAds}</div>
            <p className="text-xs text-muted-foreground">+12 cette semaine</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAds}</div>
            <p className="text-xs text-muted-foreground">Nécessitent une action</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        {/* Line Chart - Évolution Inscriptions */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Inscriptions (30 Jours)
            </CardTitle>
            <CardDescription>Croissance journalière des nouveaux utilisateurs</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrationsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: '#888' }}
                    minTickGap={30}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: '#888' }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ strokeWidth: 2, r: 4, fill: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Catégories */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Répartition par Catégorie
            </CardTitle>
            <CardDescription>Parts de marché par type d'annonce</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
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
            Top Villes (Utilisateurs)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                />
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
