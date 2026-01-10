import { NextResponse } from "next/server";

type FrequencyItem = {
  time: string;
  totalVisits: number;
  uniqueVisitors: number;
};

// Generate hourly data (e.g. last 24 hours)
const generateHourlyFrequency = (hours: number = 24): FrequencyItem[] => {
  const frequency: FrequencyItem[] = [];
  const now = new Date();
  now.setMinutes(0, 0, 0);

  for (let i = hours - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setHours(now.getHours() - i);

    const totalVisits = Math.floor(Math.random() * 80) + 10;
    const uniqueVisitors = Math.floor(
      totalVisits * (0.6 + Math.random() * 0.4)
    );

    frequency.push({
      time: date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true }), // e.g. "3 PM"
      totalVisits,
      uniqueVisitors,
    });
  }

  return frequency;
};

// Generate daily data (e.g. last 3 days)
const generateDailyFrequency = (days: number = 3): FrequencyItem[] => {
  const frequency: FrequencyItem[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);

    const totalVisits = Math.floor(Math.random() * 600) + 100;
    const uniqueVisitors = Math.floor(
      totalVisits * (0.6 + Math.random() * 0.4)
    );

    frequency.push({
      time: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }), // e.g. "Oct 19"
      totalVisits,
      uniqueVisitors,
    });
  }

  return frequency;
};

// Generate monthly data (e.g. last 30 days)
const generateMonthlyFrequency = (days: number = 30): FrequencyItem[] => {
  const frequency: FrequencyItem[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);

    const totalVisits = Math.floor(Math.random() * 2000) + 300;
    const uniqueVisitors = Math.floor(
      totalVisits * (0.6 + Math.random() * 0.4)
    );

    frequency.push({
      time: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }), // e.g. "Oct 5"
      totalVisits,
      uniqueVisitors,
    });
  }

  return frequency;
};

// Generate yearly data (e.g. last 12 months)
const generateYearlyFrequency = (months: number = 12): FrequencyItem[] => {
  const frequency: FrequencyItem[] = [];
  const now = new Date();
  now.setDate(1);

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(now.getMonth() - i);

    const totalVisits = Math.floor(Math.random() * 8000) + 1000;
    const uniqueVisitors = Math.floor(
      totalVisits * (0.6 + Math.random() * 0.4)
    );

    frequency.push({
      time: date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }), // e.g. "Oct '25"
      totalVisits,
      uniqueVisitors,
    });
  }

  return frequency;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "month"; // default = hourly

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Project ID required" },
      { status: 400 }
    );
  }

  // Choose dataset based on range
  let frequency: FrequencyItem[] = [];
  switch (range) {
    case "3d":
      frequency = generateDailyFrequency(3);
      break;
    case "month":
      frequency = generateMonthlyFrequency(30);
      break;
    case "year":
      frequency = generateYearlyFrequency(12);
      break;
    default:
      frequency = generateHourlyFrequency(24);
  }

  // Mock summary metrics
  const totalVisits = frequency.reduce((a, b) => a + b.totalVisits, 0);
  const uniqueVisitors = frequency.reduce((a, b) => a + b.uniqueVisitors, 0);
  const onlineVisitors = Math.floor(Math.random() * 100);
  const locationCount = Math.floor(uniqueVisitors * 0.7);

  return NextResponse.json({
    success: true,
    message: "Analytics fetched successfully",
    data: {
      url: `https://idolo.dev`,
      name: `Idolo.Dev`,
      filter: range,
      totalVisits,
      totalVisitsChange: "+12.5%",
      uniqueVisitors,
      uniqueVisitorsChange: "+8.2%",
      onlineVisitors,
      bounceRate: parseFloat((Math.random() * 50 + 10).toFixed(1)),
      frequency,
      osSummary: [
        { osName: "Windows", count: Math.floor(uniqueVisitors * 0.4) },
        { osName: "macOS", count: Math.floor(uniqueVisitors * 0.3) },
        { osName: "Linux", count: Math.floor(uniqueVisitors * 0.2) },
      ],
      deviceSummary: [
        { deviceType: "Desktop", count: Math.floor(uniqueVisitors * 0.7) },
        { deviceType: "Mobile", count: Math.floor(uniqueVisitors * 0.3) },
      ],
      browserSummary: [
        { browserName: "Chrome", count: Math.floor(uniqueVisitors * 0.5) },
        { browserName: "Firefox", count: Math.floor(uniqueVisitors * 0.2) },
        { browserName: "Safari", count: Math.floor(uniqueVisitors * 0.2) },
      ],
      topPaths: [
        { pathname: "/home", count: Math.floor(totalVisits * 0.4) },
        { pathname: "/about", count: Math.floor(totalVisits * 0.15) },
        { pathname: "/pricing", count: Math.floor(totalVisits * 0.1) },
      ],
      topHostnames: [
        {
          hostname: "project.example.com",
          count: Math.floor(totalVisits * 0.9),
        },
        {
          hostname: "staging.project.example.com",
          count: Math.floor(totalVisits * 0.2),
        },
      ],
      topReferrers: [
        {
          referrer: "https://google.com",
          count: Math.floor(totalVisits * 0.3),
        },
        {
          referrer: "https://twitter.com",
          count: Math.floor(totalVisits * 0.15),
        },
      ],
      topUtmSources: [
        { utmSource: "newsletter", count: Math.floor(totalVisits * 0.12) },
        { utmSource: "adwords", count: Math.floor(totalVisits * 0.08) },
      ],
      topCountries: [
        { country: "US", count: Math.floor(locationCount * 0.4) },
        { country: "DE", count: Math.floor(locationCount * 0.2) },
        { country: "GB", count: Math.floor(locationCount * 0.15) },
      ],
      topCities: [
        { city: "New York", count: Math.floor(locationCount * 0.2) },
        { city: "Berlin", count: Math.floor(locationCount * 0.1) },
        { city: "London", count: Math.floor(locationCount * 0.08) },
        { city: "San Francisco", count: Math.floor(locationCount * 0.07) },
      ],
    },
  });
}
