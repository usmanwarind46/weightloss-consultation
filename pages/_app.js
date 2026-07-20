import "@/styles/globals.css";
import "@/styles/fonts.css";
import "@/styles/paymentpage.css";
import queryClient from "@/utils/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import RouteGuard from "@/utils/RouteGuard";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Script from "next/script";

// ─────────────────────────────────────────────
// CONSTANTS — same domain, same storage key
// ─────────────────────────────────────────────
const ATTRIBUTION_STORAGE_KEY = "owlc_attribution";
const ROOT_DOMAIN = "onlineweightlossclinic.co.uk";

const PAID_MEDIUMS = new Set([
  "cpc",
  "ppc",
  "paid",
  "paid_search",
  "paidsearch",
  "paid_social",
  "paidsocial",
  "social_paid",
  "display",
  "cpa",
  "cpv",
  "cpm",
]);

const ORGANIC_MEDIUMS = new Set([
  "organic",
  "organic_search",
  "organic_social",
  "social",
]);

const SEARCH_SOURCES = [
  "google",
  "bing",
  "yahoo",
  "duckduckgo",
  "baidu",
  "yandex",
  "ecosia",
  "gmb",
  "gmb_listing",
  "google_business",
  "google_business_profile",
];

const SOCIAL_SOURCES = [
  "facebook",
  "fb",
  "instagram",
  "ig",
  "meta",
  "linkedin",
  "tiktok",
  "twitter",
  "x",
  "youtube",
  "pinterest",
  "snapchat",
  "reddit",
];

// ─────────────────────────────────────────────
// HELPERS — website se same
// ─────────────────────────────────────────────
function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function includesSource(value, sources) {
  const normalized = normalizeValue(value);
  return sources.some(
    (source) =>
      normalized === source ||
      normalized.includes(`${source}.`) ||
      normalized.includes(`_${source}`) ||
      normalized.includes(`${source}_`),
  );
}

function getHostname(url) {
  if (!url) return "";
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isInternalHostname(hostname) {
  const normalized = String(hostname || "")
    .toLowerCase()
    .replace(/^www\./, "");
  return normalized === ROOT_DOMAIN || normalized.endsWith(`.${ROOT_DOMAIN}`);
}

function isSearchSource(value) {
  return includesSource(value, SEARCH_SOURCES);
}
function isSocialSource(value) {
  return includesSource(value, SOCIAL_SOURCES);
}

function getSearchEngine(value) {
  const n = normalizeValue(value);
  if (n.includes("google")) return "google";
  if (n.includes("bing")) return "bing";
  if (n.includes("yahoo")) return "yahoo";
  if (n.includes("duckduckgo")) return "duckduckgo";
  if (n.includes("baidu")) return "baidu";
  if (n.includes("yandex")) return "yandex";
  if (n.includes("ecosia")) return "ecosia";
  return "search_engine";
}

function getSocialPlatform(value) {
  const n = normalizeValue(value);
  if (n.includes("facebook") || n === "fb" || n.includes("l.facebook"))
    return "facebook";
  if (n.includes("instagram") || n === "ig") return "instagram";
  if (n.includes("linkedin")) return "linkedin";
  if (n.includes("tiktok")) return "tiktok";
  if (n === "x" || n.includes("twitter") || n.includes("t.co")) return "x";
  if (n.includes("youtube")) return "youtube";
  if (n.includes("pinterest")) return "pinterest";
  if (n.includes("snapchat")) return "snapchat";
  if (n.includes("reddit")) return "reddit";
  return "social";
}

function readStoredAttribution() {
  try {
    const stored = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveStoredAttribution(attribution) {
  try {
    localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
    const firstTouch = attribution.first_touch;
    if (firstTouch) {
      localStorage.setItem(
        "utm_source",
        firstTouch.utm_source || firstTouch.source || "direct",
      );
      localStorage.setItem(
        "utm_medium",
        firstTouch.utm_medium || firstTouch.medium || "none",
      );
      localStorage.setItem("utm_campaign", firstTouch.utm_campaign || "none");
    }
  } catch (error) {
    console.error("Unable to save attribution:", error);
  }
}

// ─────────────────────────────────────────────
// CLEAR ATTRIBUTION — order k baad call karo
// ─────────────────────────────────────────────
export function clearAttribution() {
  try {
    localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
    localStorage.removeItem("utm_source");
    localStorage.removeItem("utm_medium");
    localStorage.removeItem("utm_campaign");
  } catch (error) {
    console.error("Unable to clear attribution:", error);
  }
}

// ─────────────────────────────────────────────
// GET ATTRIBUTION — order API mein use karo
// ─────────────────────────────────────────────
export function getAttribution() {
  try {
    const stored = readStoredAttribution();
    if (!stored) return null;

    return {
      first_touch_source: stored.first_touch?.source || "direct",
      first_touch_medium: stored.first_touch?.medium || "none",
      first_touch_channel: stored.first_touch?.channel || "Direct",
      first_touch_campaign: stored.first_touch?.utm_campaign || "none",
      first_touch_paid: stored.first_touch?.paid_status || "unknown",

      last_touch_source: stored.last_touch?.source || "direct",
      last_touch_medium: stored.last_touch?.medium || "none",
      last_touch_channel: stored.last_touch?.channel || "Direct",
      last_touch_campaign: stored.last_touch?.utm_campaign || "none",
      last_touch_paid: stored.last_touch?.paid_status || "unknown",

      click_ids: stored.first_touch?.click_ids || {},
      landing_page: stored.first_touch?.landing_page || "",
      captured_at: stored.first_touch?.captured_at || "",
    };
  } catch {
    return null;
  }
}

function detectAttribution() {
  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer || "";
  const referrerHostname = getHostname(referrer);
  const isInternalReferrer = isInternalHostname(referrerHostname);

  const utmSource = params.get("utm_source") || "";
  const utmMedium = params.get("utm_medium") || "";
  const utmCampaign = params.get("utm_campaign") || "";
  const utmTerm = params.get("utm_term") || "";
  const utmContent = params.get("utm_content") || "";
  const utmId = params.get("utm_id") || "";

  const gclid = params.get("gclid") || "";
  const gbraid = params.get("gbraid") || "";
  const wbraid = params.get("wbraid") || "";
  const dclid = params.get("dclid") || "";
  const gadSource = params.get("gad_source") || "";
  const gadCampaignId = params.get("gad_campaignid") || "";
  const msclkid = params.get("msclkid") || "";
  const fbclid = params.get("fbclid") || "";
  const ttclid = params.get("ttclid") || "";
  const linkedInClickId = params.get("li_fat_id") || "";
  const twitterClickId = params.get("twclid") || "";

  const normalizedMedium = normalizeValue(utmMedium);
  const hasGooglePaidIdentifier = Boolean(
    gclid || gbraid || wbraid || gadSource || gadCampaignId,
  );
  const hasAnyTrackingSignal = Boolean(
    utmSource ||
    utmMedium ||
    utmCampaign ||
    utmTerm ||
    utmContent ||
    utmId ||
    gclid ||
    gbraid ||
    wbraid ||
    dclid ||
    gadSource ||
    gadCampaignId ||
    msclkid ||
    fbclid ||
    ttclid ||
    linkedInClickId ||
    twitterClickId,
  );

  let source = "direct";
  let medium = "none";
  let channel = "Direct";
  let paidStatus = "unknown";
  let confidence = "medium";
  let evidence = ["no_external_referrer_or_tracking_parameter"];

  if (hasGooglePaidIdentifier) {
    source = "google";
    medium = "cpc";
    channel = "Paid Search";
    paidStatus = "paid";
    confidence = "high";
    evidence = [
      gclid && "gclid",
      gbraid && "gbraid",
      wbraid && "wbraid",
      gadSource && "gad_source",
      gadCampaignId && "gad_campaignid",
    ].filter(Boolean);
  } else if (dclid) {
    source = "google";
    medium = "display";
    channel = "Display";
    paidStatus = "paid";
    confidence = "high";
    evidence = ["dclid"];
  } else if (msclkid) {
    source = "bing";
    medium = "cpc";
    channel = "Paid Search";
    paidStatus = "paid";
    confidence = "high";
    evidence = ["msclkid"];
  } else if (utmMedium && PAID_MEDIUMS.has(normalizedMedium)) {
    source = normalizeValue(utmSource) || "unknown";
    medium = normalizedMedium;
    paidStatus = "paid";
    confidence = "high";
    evidence = ["paid_utm_medium"];
    if (isSocialSource(source)) channel = "Paid Social";
    else if (isSearchSource(source)) channel = "Paid Search";
    else if (normalizedMedium === "display") channel = "Display";
    else channel = "Paid Other";
  } else if (utmSource || utmMedium) {
    source = normalizeValue(utmSource) || "unknown";
    medium = normalizedMedium || "unknown";
    confidence = "high";
    evidence = ["manual_utm"];
    if (ORGANIC_MEDIUMS.has(normalizedMedium)) {
      paidStatus = "organic";
      if (isSocialSource(source)) channel = "Organic Social";
      else if (isSearchSource(source)) channel = "Organic Search";
      else channel = "Organic";
    } else if (normalizedMedium === "email") {
      channel = "Email";
      paidStatus = "unknown";
    } else if (normalizedMedium === "referral") {
      channel = "Referral";
      paidStatus = "organic";
    } else if (
      normalizedMedium === "affiliate" ||
      normalizedMedium === "affiliates"
    ) {
      channel = "Affiliates";
      paidStatus = "unknown";
    } else {
      channel = "Unassigned";
      paidStatus = "unknown";
    }
  } else if (fbclid) {
    source = isSocialSource(referrerHostname)
      ? getSocialPlatform(referrerHostname)
      : "meta";
    medium = "social";
    channel = "Social";
    paidStatus = "unknown";
    confidence = "medium";
    evidence = ["fbclid"];
  } else if (ttclid) {
    source = "tiktok";
    medium = "social";
    channel = "Social";
    paidStatus = "unknown";
    confidence = "medium";
    evidence = ["ttclid"];
  } else if (linkedInClickId) {
    source = "linkedin";
    medium = "social";
    channel = "Social";
    paidStatus = "unknown";
    confidence = "medium";
    evidence = ["li_fat_id"];
  } else if (twitterClickId) {
    source = "x";
    medium = "social";
    channel = "Social";
    paidStatus = "unknown";
    confidence = "medium";
    evidence = ["twclid"];
  } else if (!isInternalReferrer && isSearchSource(referrerHostname)) {
    source = getSearchEngine(referrerHostname);
    medium = "organic";
    channel = "Organic Search";
    paidStatus = "organic";
    confidence = "medium";
    evidence = ["search_engine_referrer"];
  } else if (!isInternalReferrer && isSocialSource(referrerHostname)) {
    source = getSocialPlatform(referrerHostname);
    medium = "social";
    channel = "Organic Social";
    paidStatus = "organic";
    confidence = "medium";
    evidence = ["social_referrer"];
  } else if (referrerHostname && !isInternalReferrer) {
    source = referrerHostname;
    medium = "referral";
    channel = "Referral";
    paidStatus = "organic";
    confidence = "medium";
    evidence = ["external_referrer"];
  } else if (isInternalReferrer) {
    source = "internal";
    medium = "internal";
    channel = "Internal";
    paidStatus = "unknown";
    confidence = "high";
    evidence = ["internal_referrer"];
  }

  return {
    source,
    medium,
    channel,
    paid_status: paidStatus,
    confidence,
    evidence,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_term: utmTerm,
    utm_content: utmContent,
    utm_id: utmId,
    click_ids: {
      gclid,
      gbraid,
      wbraid,
      dclid,
      msclkid,
      fbclid,
      ttclid,
      li_fat_id: linkedInClickId,
      twclid: twitterClickId,
    },
    google_ads: { gad_source: gadSource, gad_campaign_id: gadCampaignId },
    landing_page: `${window.location.pathname}${window.location.search}`,
    landing_url: window.location.href,
    referrer,
    referrer_hostname: referrerHostname || null,
    captured_at: new Date().toISOString(),
    has_tracking_signal: hasAnyTrackingSignal,
    is_internal_referrer: isInternalReferrer,
  };
}

function initializeAttribution() {
  const currentTouch = detectAttribution();
  const storedAttribution = readStoredAttribution();

  if (!storedAttribution?.first_touch) {
    saveStoredAttribution({
      first_touch: currentTouch,
      last_touch: currentTouch,
    });
    return;
  }

  const hasExternalReferrer =
    Boolean(currentTouch.referrer_hostname) &&
    !currentTouch.is_internal_referrer;

  const shouldUpdateLastTouch =
    currentTouch.has_tracking_signal || hasExternalReferrer;

  if (shouldUpdateLastTouch) {
    saveStoredAttribution({ ...storedAttribution, last_touch: currentTouch });
  } else {
    saveStoredAttribution(storedAttribution);
  }
}

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────
export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      if (window.fbq) window.fbq("track", "PageView");
      if (window._cl) window._cl.pageview();
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events]);

  useEffect(() => {
    initializeAttribution();

    try {
      const saved = JSON.parse(
        localStorage.getItem(ATTRIBUTION_STORAGE_KEY) || "null",
      );
      console.log("=== CONSULTATION ATTRIBUTION DEBUG ===");
      console.log("First Touch:", saved?.first_touch);
      console.log("Last Touch:", saved?.last_touch);
    } catch (error) {
      console.error("Unable to read attribution:", error);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Script id="customerlabs-tag" strategy="afterInteractive">
        {`!function(t,e,r,c,a,n,s){t.ClAnalyticsObject=a,t[a]=t[a]||[],t[a].methods=["trackSubmit","trackClick","pageview","identify","track","trackConsent"],t[a].factory=function(e){return function(){var r=Array.prototype.slice.call(arguments);return r.unshift(e),t[a].push(r),t[a]}};for(var i=0;i<t[a].methods.length;i++){var o=t[a].methods[i];t[a][o]=t[a].factory(o)};n=e.createElement(r),s=e.getElementsByTagName(r)[0],n.async=1,n.crossOrigin="anonymous",n.src=c,s.parentNode.insertBefore(n,s)}(window,document,"script","https://cdn.js.customerlabs.co/cl8602w8wtgm8u.js","_cl");_cl.SNIPPET_VERSION="2.0.0"`}
      </Script>

      <RouteGuard>
        <Component {...pageProps} />
      </RouteGuard>

      <Toaster
        position="top-center"
        reverseOrder={false}
        containerClassName="reg-font"
      />
    </QueryClientProvider>
  );
}
