"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  ClipboardList,
  Flag,
  User,
  TrendingDown,
  // Minus,
  TrendingUp,
  Award,
  BarChart3,
  CheckCircle,
} from "lucide-react";

import { GetBmiJourney } from "@/api/mergeRoutes";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";

/* =================================
   HELPERS
================================= */

// kg → stones & pounds
const kgToStonesPounds = (kg) => {
  if (!kg) return { stones: 0, pounds: 0 };
  const totalPounds = kg * 2.20462;
  const stones = Math.floor(totalPounds / 14);
  const pounds = Math.round(totalPounds % 14);
  return { stones, pounds };
};

// get weight based on selected unit
const getWeightByUnit = (item, unit) => {
  if (unit === "kg") {
    return Number(item.weight_kg);
  }

  // ❌ WRONG: returning TOTAL POUNDS
  if (item.weight_stones || item.weight_pounds) {
    return item.weight_stones * 14 + (item.weight_pounds ?? 0);
  }

  const { stones, pounds } = kgToStonesPounds(item.weight_kg);
  return stones * 14 + pounds;
};

// format weight for cards
const formatWeight = (value, unit) => {
  if (unit === "kg") return `${value} kg`;
  const st = Math.floor(value / 14);
  const lb = Math.round(value % 14);
  return `${st} st ${lb} lb`;
};

const toneStyles = {
  green: "ring-1 ring-emerald-400/40",
  red: "ring-1 ring-red-400/40",
  gray: "ring-1 ring-slate-300/40",
  default: "",
};

const getChangeMeta = (change) => {
  // Weight GAIN
  if (change > 0) {
    return {
      type: "gain",
      color: "red",
      label: "Gained",
    };
  }

  // Weight LOSS
  if (change < 0) {
    return {
      type: "loss",
      color: "green",
      label: "Lost",
    };
  }

  // NO CHANGE (also red as per your requirement)
  return {
    type: "same",
    color: "red",
    label: "No Change",
  };
};

// chart data (ALWAYS KG)
const prepareChartData = (journey, unit) =>
  journey.map((item) => ({
    date: item.order_date_readable,
    value: Number(item.weight_kg), // ✅ FIXED
    label:
      unit === "kg"
        ? `${item.weight_kg} kg`
        : (() => {
            const { stones, pounds } =
              item.weight_stones || item.weight_pounds
                ? {
                    stones: item.weight_stones,
                    pounds: item.weight_pounds ?? 0,
                  }
                : kgToStonesPounds(item.weight_kg);
            return `${stones} st ${pounds} lb`;
          })(),
  }));

// calculate stats
const calculateStats = (journey, unit) => {
  const values = journey.map((item) => getWeightByUnit(item, unit));

  return {
    start: values[0],
    current: values[values.length - 1],
    lowest: Math.min(...values),
    avg: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)),
  };
};

/* =================================
   PAGE
================================= */
const getChangeDescription = (type) => {
  if (type === "loss") return "Weight loss since start";
  if (type === "gain") return "Weight gain since start";
  return "No progress since start";
};

export default function WeightJourneyPage() {
  const { authUserDetail } = useAuthUserDetailStore();
  const userId = authUserDetail?.id;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [unit, setUnit] = useState("kg"); // 👈 TAB STATE

  const getJourney = useMutation({
    mutationFn: (id) => GetBmiJourney(id),
    onSuccess: (res) => {
      setData(res?.data || []);
      setLoading(false);
    },
    onError: () => {
      toast.error("Failed to load journey");
      setLoading(false);
    },
  });

  useEffect(() => {
    if (userId) getJourney.mutate(userId);
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4565bf]" />
      </div>
    );
  }

  if (!data?.bmi_journey?.length) {
    return <EmptyJourneyState />;
  }

  const { bmi_journey } = data;

  const stats = calculateStats(bmi_journey, unit);
  const totalChange = stats.current - stats.start;
  const changeMeta = getChangeMeta(totalChange);

  const percentage = stats.start
    ? Math.abs((totalChange / stats.start) * 100).toFixed(1)
    : 0;

  return (
    <div className="p-6 space-y-10 min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Weight Loss Journey
          </h1>
          <p className="text-sm text-slate-500">
            Your personalised progress overview
          </p>
        </div>

        {/* Unit Tabs */}
        <div className="mt-2 sm:mt-0">
          <UnitTabs unit={unit} setUnit={setUnit} />
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid journey-grid gap-5">
        <JourneyStatCard
          title="Starting Weight"
          value={formatWeight(stats.start, unit)}
          description="First recorded weight"
          badge="Baseline"
          icon={Flag}
        />
        <JourneyStatCard
          title="Current Weight"
          value={formatWeight(stats.current, unit)}
          description="Most recent update"
          badge="Latest"
          icon={User}
        />
        <JourneyStatCard
          title="Total Change"
          value={
            changeMeta.type === "same"
              ? formatWeight(0, unit)
              : formatWeight(Math.abs(totalChange), unit)
          }
          description={getChangeDescription(changeMeta.type)}
          badge={changeMeta.type === "same" ? "0%" : `${percentage}%`}
          icon={TrendingDown}
          highlight
          tone={changeMeta.color}
        />
        <JourneyStatCard
          title="Total Orders"
          value={bmi_journey.length}
          description="Orders placed & approved"
          badge="Approved"
          icon={ClipboardList}
        />

        {/* <JourneyStatCard
                    title="Lowest Weight"
                    value={formatWeight(stats.lowest, unit)}
                    description="Lowest recorded point"
                    badge="Best"
                    icon={Award}
                />

                <JourneyStatCard
                    title="Average Weight"
                    value={formatWeight(stats.avg, unit)}
                    description="Average over period"
                    badge="Avg"
                    icon={BarChart3}
                /> */}
      </div>

      {/* CHART */}
      <ChartCard title="Weight Progression">
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={prepareChartData(bmi_journey, unit)}>
            <CartesianGrid vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="date" />
            <YAxis
              tickFormatter={(v) =>
                unit === "kg"
                  ? `${v}`
                  : (() => {
                      const { stones, pounds } = kgToStonesPounds(v);
                      return `${stones}st`;
                    })()
              }
            />

            <Tooltip
              content={({ payload }) => {
                if (!payload || !payload.length) return null;

                const { value, label } = payload[0].payload;

                return (
                  <div className="bg-white px-3 py-2 rounded-md shadow-md border">
                    <p className="text-black text-sm font-semibold">
                      {unit === "kg" ? `${value} kg` : label}
                    </p>
                  </div>
                );
              }}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#4565bf"
              strokeWidth={2.6}
              dot={{ r: 4, fill: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

/* =================================
   COMPONENTS
================================= */
const getTrendIcon = (tone, DefaultIcon) => {
  if (tone === "green") return TrendingDown; // loss ↓
  if (tone === "red") return TrendingUp; // gain ↑
  return DefaultIcon; // 👈 baqi cards
};

const UnitTabs = ({ unit, setUnit }) => (
  <div className="inline-flex bg-white/70 backdrop-blur-xl rounded-full p-1 border border-white/60 shadow-sm">
    {["kg", "st"].map((u) => (
      <button
        key={u}
        onClick={() => setUnit(u)}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition cursor-pointer
                    ${
                      unit === u
                        ? "bg-[#4565bf] text-white shadow"
                        : "text-[#4565bf] hover:bg-[#4565bf]/10"
                    }`}
      >
        {u === "kg" ? "KG" : "St / Lb"}
      </button>
    ))}
  </div>
);

const JourneyStatCard = ({
  title,
  value,
  description,
  badge,
  icon: Icon,
  highlight,
  tone = "default",
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -6, scale: 1.02 }}
    transition={{ duration: 0.35 }}
    className={`relative rounded-[28px] bg-white/70 backdrop-blur-xl
    border border-white/60 shadow-[0_28px_70px_rgba(15,23,42,0.14)]
    p-6 overflow-hidden
    ${highlight ? toneStyles[tone] : ""}
`}
  >
    <div className="absolute inset-0 bg-gradient-to-b from-[#4565bf]/22 via-[#4565bf]/8 to-white/40 pointer-events-none" />

    <div className="relative flex items-center justify-between mb-4">
      {(() => {
        const FinalIcon = getTrendIcon(tone, Icon);

        return (
          <div
            className={`w-12 h-12 rounded-2xl backdrop-blur flex items-center justify-center shadow-md border
                ${
                  tone === "green"
                    ? "bg-emerald-50 border-emerald-200"
                    : tone === "red"
                      ? "bg-red-50 border-red-200"
                      : "bg-white/80 border-white/70"
                }`}
          >
            <FinalIcon
              className={`
        w-5 h-5 sm:w-[22px] sm:h-[22px]
        ${
          tone === "green"
            ? "text-emerald-600"
            : tone === "red"
              ? "text-red-600"
              : "text-[#4565bf]"
        }`}
            />
          </div>
        );
      })()}

      {badge && (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
        border backdrop-blur text-xs font-semibold
        ${
          tone === "green"
            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
            : tone === "red"
              ? "bg-red-50 text-red-600 border-red-200"
              : "bg-white/60 text-[#4565bf] border-white/70"
        }`}
        >
          <CheckCircle size={16} />
          {badge}
        </span>
      )}
    </div>

    <p className="text-[11px] tracking-[0.22em] uppercase text-slate-500 ">
      {title}
    </p>

    <div
      className={`mt-3   text-[22px] sm:text-[24px] xl:text-[28px] font-bold leading-none
        ${
          tone === "green"
            ? "text-emerald-600"
            : tone === "red"
              ? "text-red-600"
              : "text-slate-900"
        }`}
    >
      {tone === "green" ? "−" : ""}
      {value}
    </div>

    <p className="mt-3 text-xs text-slate-600">{description}</p>
  </motion.div>
);

const ChartCard = ({ title, children }) => (
  <div className="relative bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_30px_70px_rgba(15,23,42,0.14)] p-6">
    <div className="absolute inset-0 bg-gradient-to-t from-[#4565bf]/18 via-[#4565bf]/6 to-white/50 pointer-events-none" />
    <h3 className="relative text-sm font-semibold text-slate-900 mb-4">
      {title}
    </h3>
    <div className="relative">{children}</div>
  </div>
);

const EmptyJourneyState = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-slate-800">
        No Weight Progression Yet
      </h2>
      <p className="text-gray-500 mt-2">
        Your journey will appear once tracking starts.
      </p>
    </div>
  </div>
);
