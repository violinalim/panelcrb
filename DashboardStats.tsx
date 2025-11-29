import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Gift, Users, TrendingUp } from "lucide-react";
import { KlasemenEntry, HadiahEntry } from "@/types";

export default function DashboardStats() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [klasemenData, setKlasemenData] = useState<KlasemenEntry[]>([]);
  const [hadiahData, setHadiahData] = useState<HadiahEntry[]>([]);
  const [stats, setStats] = useState({
    totalWinners: 0,
    totalWinloss: 0,
    totalTurnover: 0,
    totalPrizes: 0,
  });

  useEffect(() => {
    const currentMonth = new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    setSelectedMonth(currentMonth);
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      fetchData();
    }
  }, [selectedMonth]);

  const fetchData = async () => {
    try {
      // Fetch Klasemen
      const klasemenSnapshot = await getDocs(collection(db, "klasemen"));
      const klasemen = klasemenSnapshot.docs.map(doc => doc.data()) as KlasemenEntry[];
      const activeKlasemen = klasemen.filter(k => k.keterangan === "Aktif");
      setKlasemenData(activeKlasemen);

      // Fetch Hadiah for selected month
      const hadiahQuery = query(
        collection(db, "hadiah"),
        where("month", "==", selectedMonth),
        where("visible", "==", true)
      );
      const hadiahSnapshot = await getDocs(hadiahQuery);
      const hadiah = hadiahSnapshot.docs.map(doc => doc.data()) as HadiahEntry[];
      setHadiahData(hadiah);

      // Calculate stats
      const totalWinloss = activeKlasemen.reduce((sum, k) => sum + k.winloss, 0);
      const totalTurnover = activeKlasemen.reduce((sum, k) => sum + k.turnover, 0);
      
      setStats({
        totalWinners: activeKlasemen.length,
        totalWinloss,
        totalTurnover,
        totalPrizes: hadiah.length,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  const generateMonths = () => {
    const months = [];
    const startDate = new Date(2025, 10); // November 2025
    for (let i = 0; i < 24; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      months.push(date.toLocaleDateString("id-ID", { month: "long", year: "numeric" }));
    }
    return months;
  };

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="bg-cosmic-panel/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50">
        <Label className="mb-2 block">Pilih Periode</Label>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {generateMonths().map(month => (
              <SelectItem key={month} value={month}>{month}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-cosmic-panel/60 backdrop-blur-xl border-border/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemenang</CardTitle>
            <Users className="h-4 w-4 text-neon-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-purple">{stats.totalWinners}</div>
            <p className="text-xs text-muted-foreground">Member aktif</p>
          </CardContent>
        </Card>

        <Card className="bg-cosmic-panel/60 backdrop-blur-xl border-border/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Winloss</CardTitle>
            <TrendingUp className="h-4 w-4 text-neon-pink" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-pink">
              {stats.totalWinloss.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">Akumulasi periode ini</p>
          </CardContent>
        </Card>

        <Card className="bg-cosmic-panel/60 backdrop-blur-xl border-border/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Turnover</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {stats.totalTurnover.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">Transaksi bulan ini</p>
          </CardContent>
        </Card>

        <Card className="bg-cosmic-panel/60 backdrop-blur-xl border-border/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hadiah Tersedia</CardTitle>
            <Gift className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.totalPrizes}</div>
            <p className="text-xs text-muted-foreground">Untuk {selectedMonth}</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Winners Table */}
      <div className="bg-cosmic-panel/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50">
        <h2 className="text-xl font-bold text-neon-purple mb-4">Top 10 Pemenang</h2>
        <div className="space-y-2">
          {klasemenData.slice(0, 10).map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                  index === 1 ? "bg-gray-400/20 text-gray-300" :
                  index === 2 ? "bg-orange-500/20 text-orange-400" :
                  "bg-secondary"
                }`}>
                  {entry.top}
                </div>
                <div>
                  <p className="font-medium">{entry.userId}</p>
                  <p className="text-xs text-muted-foreground">TO: {entry.turnover.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-neon-purple">{entry.winloss.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{entry.hadiah}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prizes for Current Month */}
      {hadiahData.length > 0 && (
        <div className="bg-cosmic-panel/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50">
          <h2 className="text-xl font-bold text-neon-purple mb-4">
            Hadiah Bulan {selectedMonth}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hadiahData.map((prize, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-br from-neon-purple/10 to-neon-pink/10 border border-border/30 rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-neon-purple">#{prize.top}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    prize.status === "Claim" ? "bg-green-500/20 text-green-400" :
                    prize.status === "Belum Claim" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-gray-500/20 text-gray-400"
                  }`}>
                    {prize.status}
                  </span>
                </div>
                <p className="font-medium mb-1">{prize.idUsername}</p>
                <p className="text-sm text-neon-pink mb-2">{prize.hadiah}</p>
                <p className="text-xs text-muted-foreground">
                  Min Winloss: {prize.minimalWinloss.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
