"use client"

import { useEffect, useState } from "react"
import { getDashboardStats } from "@/app/actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, CheckCircle, ShoppingBag, AlertCircle, Download, TrendingUp, MapPin, Tag, Sparkles, Activity, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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

    try {
      const realStats = await getDashboardStats()
      if (realStats) {
        setStats({
          totalUsers: realStats.totalUsers,
          verifiedMerchants: realStats.verifiedMerchants,
          totalListings: realStats.totalListings,
          pendingReports: realStats.pendingReports
        })

        // Update charts with real data if available and not empty, else potentially keep mocks or show empty state
        // For better UX, if real data is empty (e.g. fresh app), showing empty charts is correct.
        if (realStats.charts.categories.length > 0 || realStats.charts.registrations.length > 0) {
          setCategoryData(realStats.charts.categories)
          setRegistrationsData(realStats.charts.registrations)
          setCityData(realStats.charts.cities)
        } else {
          // Optional: If absolutely no data, you might want to show mocks or a message.
          // But since user requested "why I see 4 categories", let's show REAL data even if empty.
          setCategoryData(realStats.charts.categories)
          setRegistrationsData(realStats.charts.registrations)
          setCityData(realStats.charts.cities)
        }

      } else {
        generateMockData() // Fallback only on total failure
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e)
      generateMockData()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleExport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      kpi: stats,
      registrations: registrationsData,
      categories: categoryData,
      cities: cityData
    }

    // Create a blob for the JSON file
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    // Create a temporary link to download
    const a = document.createElement('a')
    a.href = url
    a.download = `chadito_dashboard_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()

    // Cleanup
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Tableau de Bord
          </h2>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            Vue d'ensemble de l'activité sur Chadito IS
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 shadow-sm border-blue-100 hover:bg-blue-50 hover:text-blue-700" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Exporter JSON
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200" onClick={() => window.print()}>
            <Activity className="h-4 w-4" />
            Imprimer PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards - Modernized */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-lg shadow-blue-100/50 bg-gradient-to-br from-white to-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Utilisateurs</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
            <div className="flex items-center text-xs text-green-600 mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Inscrits sur la plateforme
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg shadow-green-100/50 bg-gradient-to-br from-white to-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vendeurs Vérifiés</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.verifiedMerchants}</div>
            <p className="text-xs text-muted-foreground mt-1">Comptes validés</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg shadow-indigo-100/50 bg-gradient-to-br from-white to-indigo-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Annonces</CardTitle>
            <div className="p-2 bg-indigo-100 rounded-full">
              <ShoppingBag className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalListings}</div>
            <p className="text-xs text-muted-foreground mt-1">Actives et vendues</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg shadow-orange-100/50 bg-gradient-to-br from-white to-orange-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Signalements</CardTitle>
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.pendingReports}</div>
            <div className="flex items-center text-xs text-orange-600 mt-1 font-medium">
              En attente de modération
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Modernized */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">

        {/* Main Area Chart */}
        <Card className="col-span-4 border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 bg-blue-100 rounded-md">
                <TrendingUp className="h-4 w-4 text-blue-700" />
              </div>
              Inscriptions (30 Jours)
            </CardTitle>
            <CardDescription>Croissance de la base utilisateurs</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    minTickGap={30}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      padding: '12px'
                    }}
                    itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="col-span-3 border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 bg-indigo-100 rounded-md">
                <Tag className="h-4 w-4 text-indigo-700" />
              </div>
              Répartition par Catégorie
            </CardTitle>
            <CardDescription>Distribution des annonces actives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-slate-600 text-xs font-medium ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart - Villes */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 bg-slate-100 rounded-md">
              <MapPin className="h-4 w-4 text-slate-700" />
            </div>
            Top Villes
          </CardTitle>
          <CardDescription>Zones géographiques les plus actives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 13, fill: '#475569', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar
                  dataKey="value"
                  fill="#334155"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                  name="Annonces"
                >
                  {cityData.map((entry, index) => (
                    // Gradient effect simulation per bar or just simpler color mapping
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#1e293b' : '#64748b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
