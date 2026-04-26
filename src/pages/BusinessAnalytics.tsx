import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  TrendingUp,
  Target,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Lightbulb,
  Building,
  FileCheck,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ReferenceLine,
} from "recharts";
import { analyzeBusiness, type BusinessAnalysis } from "@/lib/gemini";

// Mock Data
const backupRevenueData = [
  { month: "Yan", actual: 12000, predicted: 12500, season: "O'rtacha" },
  { month: "Fev", actual: 13000, predicted: 13200, season: "O'rtacha" },
  { month: "Mar", actual: 19000, predicted: 18500, season: "Navro'z" },
  { month: "Apr", actual: 15000, predicted: 14800, season: "Ramazon" },
  { month: "May", actual: 16000, predicted: 16500, season: "O'rtacha" },
  { month: "Iyun", actual: 14000, predicted: 15000, season: "O'rtacha" },
  { month: "Iyul", actual: 11000, predicted: 12000, season: "Past" },
  { month: "Avg", actual: 10500, predicted: 11000, season: "Past" },
  { month: "Sen", actual: 14000, predicted: 13500, season: "O'rtacha" },
  { month: "Okt", actual: 17000, predicted: 16800, season: "Yuqori" },
  { month: "Noy", actual: 18000, predicted: 17500, season: "Yuqori" },
  { month: "Dek", actual: 22000, predicted: 21000, season: "Yangi Yil" },
];

const backupCompetitorsData = [
  { subject: "Narx", A: 120, B: 110, fullMark: 150 },
  { subject: "Sifat", A: 98, B: 130, fullMark: 150 },
  { subject: "Lokatsiya", A: 86, B: 130, fullMark: 150 },
  { subject: "Marketing", A: 99, B: 100, fullMark: 150 },
  { subject: "Kassadagi xizmat", A: 85, B: 90, fullMark: 150 },
  { subject: "Mijoz sadoqati", A: 65, B: 85, fullMark: 150 },
];

const backupTrafficData = [
  { time: "08:00", foot: 120, car: 400 },
  { time: "10:00", foot: 350, car: 850 },
  { time: "12:00", foot: 600, car: 900 },
  { time: "14:00", foot: 850, car: 1100 },
  { time: "16:00", foot: 500, car: 700 },
  { time: "18:00", foot: 750, car: 1200 },
  { time: "20:00", foot: 400, car: 600 },
  { time: "22:00", foot: 100, car: 200 },
];

const backupCashflowData = [
  { month: "M-1", balance: -50000 },
  { month: "M-2", balance: -55000 },
  { month: "M1", balance: -45000 },
  { month: "M2", balance: -30000 },
  { month: "M3", balance: -10000 },
  { month: "M4", balance: 5000 },
  { month: "M5", balance: 25000 },
  { month: "M6", balance: 45000 },
];

export default function BusinessAnalytics() {
  const [businessType, setBusinessType] = useState("coffee");
  const [location, setLocation] = useState("tashkent-center");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeBusiness(businessType, location);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
      // In a real app, we would show a toast error here
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isRecommended = analysis ? (analysis.decision.openBusiness === "YES") : true;

  const currentRevenueData = analysis?.chartData?.revenue || backupRevenueData;
  const currentCompetitorsData = analysis?.chartData?.competitors || backupCompetitorsData;
  const currentTrafficData = analysis?.chartData?.traffic || backupTrafficData;
  const currentCashflowData = analysis?.chartData?.cashflow || backupCashflowData;
  const metrics = analysis?.financialDetails;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            SME Biznes Tahlil Platformasi
          </h1>
          <p className="text-muted-foreground mt-1">
            Sun'iy intellekt yordamida biznesingiz muvaffaqiyatini baholang
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Building className="w-4 h-4" />
                Bank Skoringi
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>
                  Kredit Qarorini Qo'llab-Quvvatlash (Bank uchun)
                </DialogTitle>
                <DialogDescription>
                  Mijoz va tanlangan biznes modeli bo'yicha integratsiyalashgan
                  xatar tahlili
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border-[6px] text-xl font-bold shrink-0 bg-background ${analysis?.decision.loanDecision === "REJECT" ? "border-red-500 text-red-600" : "border-emerald-500 text-emerald-600"}`}>
                    {analysis?.decision.loanDecision === "REJECT" ? "C" : "A-"}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">
                      Mijoz Skoringi: {analysis?.decision.loanDecision === "REJECT" ? "C (520/850)" : "A- (720/850)"}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {analysis?.decision.loanDecision === "REJECT" 
                        ? "Tanlangan biznes yuqori xatarli. " + (analysis?.reasons?.[0] || "") 
                        : "Mijozning to'lov intizomi yaxshi. Tanlangan hududdagi biznes modeli o'rtacha xatarda, lekin kutilayotgan ROI qoniqarli."}
                    </p>
                  </div>
                </div>

                <h4 className="font-medium">Kredit tavsiyasi:</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="text-muted-foreground">
                      Qaror:
                    </span>
                    <span className={`font-bold ${analysis?.decision.loanDecision === "REJECT" ? "text-red-500" : "text-emerald-500"}`}>{analysis?.decision.loanDecision || "APPROVE"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="text-muted-foreground">
                      Xatar (PD):
                    </span>
                    <span className="font-semibold">{analysis?.metrics.riskPD || 12}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="text-muted-foreground">
                      ROI:
                    </span>
                    <span className="font-semibold">{analysis?.metrics.roi || 15}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pb-2">
                    <span className="text-muted-foreground">
                      O'zini oqlash (oy):
                    </span>
                    <span className="font-semibold">
                      {analysis?.metrics.breakEvenMonths || 14}
                    </span>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="gap-2 bg-primary" onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Yangi Tahlil
          </Button>
        </div>
      </div>

      <Card className="border-primary/20 shadow-md bg-gradient-to-br from-card to-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="grid sm:grid-cols-2 gap-4 flex-1 w-full">
              <div className="space-y-1.5">
                <Label>Biznes Yo'nalishi</Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Biznes turini tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coffee">
                      Qahvaxona (Coffee Shop)
                    </SelectItem>
                    <SelectItem value="pharmacy">Dorixona</SelectItem>
                    <SelectItem value="minimarket">Mini-market</SelectItem>
                    <SelectItem value="clothing">Kiyim Do'koni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Lokatsiya (Geozona)</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Hududni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tashkent-center">
                      Toshkent, Markaz
                    </SelectItem>
                    <SelectItem value="tashkent-yuns">
                      Toshkent, Yunusobod
                    </SelectItem>
                    <SelectItem value="tashkent-chil">
                      Toshkent, Chilonzor
                    </SelectItem>
                    <SelectItem value="samarkand">Samarqand, Markaz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex-shrink-0 bg-background rounded-xl p-4 border flex items-center gap-4 w-full lg:w-auto">
              <div
                className={`p-3 rounded-full ${isRecommended ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : "bg-red-100 text-red-600 dark:bg-red-900/30"}`}
              >
                {isRecommended ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <XCircle className="w-8 h-8" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground w-full">
                  "Men bu biznesni, shu joyda, hozir ochamanmi?"
                </div>
                <div className="text-xl font-bold flex items-center gap-2 mt-0.5">
                  {isRecommended ? "Tavsiya etiladi" : "Tavsiya etilmaydi"}
                  <Badge
                    variant="secondary"
                    className={isRecommended ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200" : "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"}
                  >
                    {analysis ? analysis.decision.confidence : 92}% AI Ishonchi
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" /> Asosiy Sabablar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {analysis.reasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-500">
                <AlertTriangle className="w-5 h-5" /> Nimalarni yaxshilash kerak?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {analysis.improvements.map((improvement, i) => (
                  <li key={i}>{improvement}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="market" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4 h-auto p-1 gap-1">
          <TabsTrigger
            value="market"
            className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Target className="w-4 h-4 mr-2 hidden sm:block" />
            Bozor
          </TabsTrigger>
          <TabsTrigger
            value="demand"
            className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <TrendingUp className="w-4 h-4 mr-2 hidden sm:block" />
            Talab
          </TabsTrigger>
          <TabsTrigger
            value="location"
            className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <MapPin className="w-4 h-4 mr-2 hidden sm:block" />
            Lokatsiya
          </TabsTrigger>
          <TabsTrigger
            value="financial"
            className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <DollarSign className="w-4 h-4 mr-2 hidden sm:block" />
            Moliya
          </TabsTrigger>
          <TabsTrigger
            value="risks"
            className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <AlertTriangle className="w-4 h-4 mr-2 hidden sm:block" />
            Xavflar
          </TabsTrigger>
        </TabsList>

        {/* A: Bozor Tahlili */}
        <TabsContent value="market" className="space-y-4 outline-none">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  TAM (Umumiy Bozor Hajmi)
                </CardTitle>
                <div className="text-2xl font-bold">{metrics?.tam || "$12.5M"}</div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Hududdagi barcha qahvaxonalar yillik aylanmasi (Total Addressable Market)
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  SAM (Xizmat Qamrovi)
                </CardTitle>
                <div className="text-2xl font-bold">{metrics?.sam || "$4.2M"}</div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Sizning imkoniyatlaringiz yetib boradigan qismi (Serviceable Available Market)
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  SOM (Egallash Mumkin)
                </CardTitle>
                <div className="text-2xl font-bold">{metrics?.som || "$850K"}</div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Haqiqiy egallash ehtimoli bo'lgan ulush (Serviceable Obtainable Market)
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Bozor To'yinganligi
                </CardTitle>
                <div className={`text-2xl font-bold ${analysis?.metrics.marketSaturation > 80 ? "text-red-500" : analysis?.metrics.marketSaturation > 50 ? "text-amber-500" : "text-emerald-500"}`}>
                  {analysis?.metrics.marketSaturation || 68}%
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {analysis?.metrics.marketSaturation > 80 ? "Bozor to'yingan (Xatar yuqori)" : "O'rtacha to'yingan (Yangi imkoniyatlar bor)"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Nisha Imkoniyati (Skor)
                </CardTitle>
                <div className="text-2xl font-bold text-primary">8.4 / 10</div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Maxsus qahva va sog'lom taomlar yetishmovchiligi (GAP)
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                GAP Tahlil: Mijoz ehtiyojlari qondirilmagan sohalar
              </CardTitle>
              <CardDescription>
                Bozordagi raqobatchilar va xaridor talabi hududida AI-tahlil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    data={currentCompetitorsData}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} />
                    <Radar
                      name="Hudud O'rtachasi"
                      dataKey="B"
                      stroke="#94a3b8"
                      fill="#94a3b8"
                      fillOpacity={0.4}
                    />
                    <Radar
                      name="Sizning Potensialingiz"
                      dataKey="A"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* B: Talab Prognozi */}
        <TabsContent value="demand" className="space-y-4 outline-none">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Daromad Prognozi (Keyingi 12 oy)</CardTitle>
              <CardDescription>
                LSTM va Prophet modellari asosidagi bashorat. Mavsumiylik
                hisobga olingan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentRevenueData}>
                    <defs>
                      <linearGradient
                        id="colorActual"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorPredicted"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="actual"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorActual)"
                      name="Haqiqiy / Bazaviy"
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorPredicted)"
                      strokeDasharray="5 5"
                      name="Bashorat"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg">
                  Mavsumiy Hodisalar Ta'siri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Navro'z (Mart)</span>
                    <span className="text-emerald-500 font-bold">
                      +35% talab
                    </span>
                  </div>
                  <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[85%]"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Ramazon (Fev-Mart)</span>
                    <span className="text-primary font-bold">
                      +18% yetkazib berish, -40% kunduzgi talab
                    </span>
                  </div>
                  <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[60%]"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Yozgi Ta'til (Iyul-Avg)</span>
                    <span className="text-red-500 font-bold">
                      -25% ofis mijozlari
                    </span>
                  </div>
                  <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full w-[25%]"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  B2B va B2C segmentatsiyasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-2">
                  <div className="flex items-center gap-4">
                    <div className="w-[30%] font-medium">B2C (Chakana)</div>
                    <div className="w-[50%] h-3 bg-blue-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[80%]"></div>
                    </div>
                    <div className="w-[20%] text-right font-semibold">80%</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-[30%] font-medium">B2B (Ofislar)</div>
                    <div className="w-[50%] h-3 bg-indigo-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[20%]"></div>
                    </div>
                    <div className="w-[20%] text-right font-semibold">20%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* C: Lokatsiya Razvedkasi */}
        <TabsContent value="location" className="space-y-4 outline-none">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="row-span-2">
              <CardHeader>
                <CardTitle>Lokatsiya Skori (0-100)</CardTitle>
                <CardDescription>
                  Piyoda, avto trafigi va Anchor punktlar bo'yicha
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="w-40 h-40 rounded-full border-8 border-primary/20 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.15)] relative">
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      fill="none"
                      stroke="currentColor"
                      className="text-primary"
                      strokeWidth="8"
                      strokeDasharray="289"
                      strokeDashoffset="45"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">{analysis?.metrics.locationScore || 85}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                      {analysis && analysis.metrics.locationScore > 80 ? "A'LO" : analysis && analysis.metrics.locationScore > 50 ? "O'rtacha" : "Yomon"}
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-4 mt-8 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Piyoda Trafigi
                    </span>
                    <span className="font-semibold">Kuniga 3,200 kishi</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Avto Trafigi</span>
                    <span className="font-semibold">Kuniga 12,000 mashina</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Anchor Obyektlar
                    </span>
                    <span className="font-semibold">Biznes markaz, OTM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Gidro/Izoxron (15 daqiqa)
                    </span>
                    <span className="font-semibold">25,000 aholi</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Soatbay Trafik Tahlili
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentTrafficData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="time" fontSize={12} />
                      <Tooltip />
                      <Bar
                        dataKey="foot"
                        fill="#3b82f6"
                        name="Piyoda"
                        radius={[4, 4, 0, 0]}
                        stackId="a"
                      />
                      <Bar
                        dataKey="car"
                        fill="#94a3b8"
                        name="Avto"
                        radius={[4, 4, 0, 0]}
                        stackId="a"
                        opacity={0.5}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Anchor Effekt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Ushbu lokatsiyadagi potensial xaridorlarning 45% "IT-Park" va
                  "Orient" biznes markazi orqali generatsiya qilinadi.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-primary/5">
                    +12% Ofis Xodimlari
                  </Badge>
                  <Badge variant="outline" className="bg-primary/5">
                    Piyoda 3 daqiqa
                  </Badge>
                  <Badge variant="outline" className="bg-primary/5">
                    Yuqori Xarid Qobiliyati
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* D: Moliyaviy Hayotiylik */}
        <TabsContent value="financial" className="space-y-4 outline-none">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Dastlabki Sarmoya
                </CardTitle>
                <div className="text-2xl font-bold">${(metrics?.initialInvestment || 45000).toLocaleString()}</div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Zararlanmaslik Nuqtasi (BEP)
                </CardTitle>
                <div className="text-2xl font-bold">Ayiga ${(metrics?.breakEvenRevenue || 8500).toLocaleString()}</div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  ROI (Qoplash muddati)
                </CardTitle>
                <div className="text-2xl font-bold">{analysis?.metrics?.breakEvenMonths || 14} oy</div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  O'rtacha Check (AOV)
                </CardTitle>
                <div className="text-2xl font-bold">${metrics?.averageOrderValue?.toFixed(2) || "4.20"}</div>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                Pul Oqimi Simulyatsiyasi (Monte-Karlo Modeli)
              </CardTitle>
              <CardDescription>
                Optimistik, mo'tadil va pessimistik ssenariylar asosida birinchi
                yil keshflou dinamikasi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentCashflowData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(val) => [`$${val}`, "Balans"]} />
                    <ReferenceLine y={0} stroke="red" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Kumulyativ Naqd Pul"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4">
                Unit Iqtisodiyot (Bir mijoz hisobi)
              </h3>
              <div className="flex flex-col md:flex-row items-center gap-4 text-center divide-y md:divide-y-0 md:divide-x">
                <div className="flex-1 py-2 md:py-0">
                  <div className="text-sm text-muted-foreground">
                    CAC (Mijoz jalb qilish)
                  </div>
                  <div className="text-xl font-bold text-red-500">-${metrics?.cac?.toFixed(2) || "1.50"}</div>
                </div>
                <div className="flex-1 py-2 md:py-0">
                  <div className="text-sm text-muted-foreground">
                    COGS (Sotilgan tovarlar tannarxi)
                  </div>
                  <div className="text-xl font-bold text-orange-500">
                    -${metrics?.cogs?.toFixed(2) || "1.10"}
                  </div>
                </div>
                <div className="flex-1 py-2 md:py-0">
                  <div className="text-sm text-muted-foreground">
                    AOV (O'rtacha Check)
                  </div>
                  <div className="text-xl font-bold text-emerald-500">
                    +${metrics?.averageOrderValue?.toFixed(2) || "4.20"}
                  </div>
                </div>
                <div className="flex-1 py-2 md:py-0">
                  <div className="text-sm text-muted-foreground">
                    LTV (Mijozning umumiy qiymati)
                  </div>
                  <div className="text-xl font-bold text-blue-500">+${metrics?.ltv?.toFixed(2) || "25.00"}</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-sm flex gap-2">
                <Lightbulb className="w-5 h-5 shrink-0" />
                <p>
                  <strong>LTV:CAC nisbati {metrics ? (metrics.ltv / metrics.cac).toFixed(1) : 16.6}</strong>. Bu biznes uchun
                  marketingga sarmoya kiritish juda daromadli bo'lishini
                  ko'rsatadi.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* E: Raqobat va Xavflar */}
        <TabsContent value="risks" className="space-y-4 outline-none">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Atrof-muhit xaritasi (1 km radius)</CardTitle>
                <CardDescription>
                  Raqobat zichligi va asosiy o'yinchilar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg h-[250px] relative overflow-hidden border">
                  {/* Map mockup */}
                  <div className="absolute inset-0 opacity-20 bg-[url('https://maps.wikimedia.org/osm-intl/14/11727/6132.png')] bg-cover bg-center mix-blend-luminosity"></div>

                  {/* Point 1 */}
                  <div className="absolute top-[30%] left-[40%] flex flex-col items-center">
                    <div className="w-3 h-3 bg-primary rounded-full ring-4 ring-primary/30 shadow-lg"></div>
                    <span className="text-[10px] font-bold bg-background/90 px-1 py-0.5 rounded shadow mt-1">
                      Sizнинг obyekt
                    </span>
                  </div>

                  {/* Competitor 1 */}
                  <div className="absolute top-[20%] left-[60%] flex flex-col items-center">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full opacity-80"></div>
                    <span className="text-[9px] font-medium mt-0.5">
                      B&B Coffee
                    </span>
                  </div>

                  {/* Competitor 2 */}
                  <div className="absolute top-[60%] left-[30%] flex flex-col items-center">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full opacity-80"></div>
                    <span className="text-[9px] font-medium mt-0.5">Paul</span>
                  </div>

                  {/* Anchor */}
                  <div className="absolute top-[45%] left-[50%] flex flex-col items-center">
                    <div className="w-4 h-4 bg-emerald-500 rotate-45 opacity-80"></div>
                    <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1 rounded mt-0.5">
                      Universitet
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-red-600 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Yopilish Ehtimoli (Risk Skori)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-3 mb-2">
                    <span className={`text-3xl font-bold ${analysis && analysis.metrics.riskPD > 50 ? "text-red-500" : analysis && analysis.metrics.riskPD > 20 ? "text-amber-500" : "text-green-500"}`}>
                      {analysis?.metrics.riskPD || 12}%
                    </span>
                    <span className="text-sm text-muted-foreground pb-1">
                      {analysis && analysis.metrics.riskPD > 50 ? "yuqori xavf darajasi" : analysis && analysis.metrics.riskPD > 20 ? "o'rtacha xavf darajasi" : "past xavf darajasi"}
                    </span>
                  </div>
                  <div className="w-full bg-background h-2 rounded-full overflow-hidden border">
                    <div className={`bg-gradient-to-r from-green-500 via-amber-500 to-red-500 h-full`} style={{ width: `${analysis?.metrics.riskPD || 12}%` }}></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Kirib kelish to'siqlari va SWOT xavflari
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 test-sm">
                  <div className="flex gap-3 items-start border-l-2 border-red-500 pl-3">
                    <div className="font-medium text-sm">
                      Ijara narxining o'zgaruvchanligi
                    </div>
                    <Badge
                      variant="outline"
                      className="ml-auto flex-shrink-0 text-red-500 border-red-200"
                    >
                      Yuqori
                    </Badge>
                  </div>
                  <div className="flex gap-3 items-start border-l-2 border-amber-500 pl-3">
                    <div className="font-medium text-sm">
                      Malakali barista topish
                    </div>
                    <Badge
                      variant="outline"
                      className="ml-auto flex-shrink-0 text-amber-500 border-amber-200"
                    >
                      O'rta
                    </Badge>
                  </div>
                  <div className="flex gap-3 items-start border-l-2 border-green-500 pl-3">
                    <div className="font-medium text-sm">
                      Bozor monopoliyasi
                    </div>
                    <Badge
                      variant="outline"
                      className="ml-auto flex-shrink-0 text-green-500 border-green-200"
                    >
                      Past
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
