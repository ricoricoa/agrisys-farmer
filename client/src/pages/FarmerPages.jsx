import { useCallback, useEffect, useState } from "react";
import AppShell from "../components/AppShell.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import BongabongWeather from "../components/BongabongWeather.jsx";
import { api } from "../services/api.js";
import useRealtimeRefresh from "../hooks/useRealtimeRefresh.js";

const damageTypes = [
  "Flood",
  "Drought",
  "Typhoon / strong wind",
  "Pest infestation",
  "Plant disease",
  "Nutrient deficiency",
  "Animal damage",
  "Fire",
  "Soil erosion",
  "Landslide",
  "Other",
];

const bongabongBarangays = [
  "Anilao",
  "Aplaya",
  "Bagong Bayan I",
  "Bagong Bayan II",
  "Batangan",
  "Bukal",
  "Camantigue",
  "Carmundo",
  "Cawayan",
  "Dayhagan",
  "Formon",
  "Hagan",
  "Hagupit",
  "Ipil",
  "Kaligtasan",
  "Labasan",
  "Labonan",
  "Libertad",
  "Lisap",
  "Luna",
  "Malitbog",
  "Mapang",
  "Masaguisi",
  "Mina de Oro",
  "Morente",
  "Ogbot",
  "Orconuma",
  "Poblacion",
  "Pulosahi",
  "Sagana",
  "San Isidro",
  "San Jose",
  "San Juan",
  "Sta. Cruz",
  "Sigange",
  "Tawas",
];

function Message({ text, error = false }) {
  return (
    <p
      role={error ? "alert" : "status"}
      className={`mt-4 rounded-lg p-3 text-sm ${
        error
          ? "border border-red-200 bg-red-50 text-red-800"
          : "border border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {text}
    </p>
  );
}

function Empty({ text }) {
  return (
    <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
      {text}
    </p>
  );
}

function Loading() {
  return (
    <p className="animate-pulse rounded-lg bg-slate-100 p-6 text-center text-sm text-slate-500">
      Loading…
    </p>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString();
}

function defaultIncidentTime() {
  return new Date(
    Date.now() - new Date().getTimezoneOffset() * 60_000,
  ).toISOString().slice(0, 16);
}

function getReportDraft() {
  try {
    return JSON.parse(
      sessionStorage.getItem("agrisystem-report-draft") || "null",
    );
  } catch {
    return null;
  }
}

export function FarmerDashboard({ token, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [lands, setLands] = useState([]);
  const [detections, setDetections] = useState([]);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError("");

    try {
      const [farmData, scanData, reportData] = await Promise.all([
        api("/farmers/me", { token }),
        api("/crop-detections", { token }),
        api("/reports/mine", { token }),
      ]);

      setProfile(farmData.profile);
      setLands(farmData.lands || []);
      setDetections(scanData.detections || []);
      setReports(reportData.reports || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeRefresh(token, load);

  const pendingReports = reports.filter(
    report => ["pending", "reviewing"].includes(report.status),
  ).length;

  const totalArea = lands.reduce(
    (total, land) => total + (Number(land.size_hectares) || 0),
    0,
  );

  const greeting = new Date().getHours() < 12
    ? "Good morning"
    : new Date().getHours() < 18
      ? "Good afternoon"
      : "Good evening";

  return (
    <AppShell onLogout={onLogout}>
      <PageHeader
        eyebrow="Farmer portal"
        title={`${greeting}, ${profile?.full_name || "Farmer"}!`}
        description="Here is an overview of your farm activities and recent updates."
        action={
          <a href="#report" className="button !w-auto">
            Report damage
          </a>
        }
      />

      {error && <Message error text={error} />}

      <section className="mt-6 rounded-xl bg-emerald-900 p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">
          Farmer action center
        </p>
        <h2 className="mt-2 text-xl font-extrabold">
          Keep your farm record ready for MAO support.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-100">
          Complete your profile and land information first. When damage occurs,
          submit photos and details through a report.
        </p>
        <a
          href="#profile"
          className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm font-bold text-emerald-900"
        >
          Update farm record
        </a>
      </section>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total farms" value={lands.length} />
        <StatCard
          label="Total farm area"
          value={`${totalArea.toFixed(2)} ha`}
          tone="blue"
        />
        <StatCard label="Crop scans" value={detections.length} />
        <StatCard
          label="Pending reports"
          value={pendingReports}
          tone="amber"
        />
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold text-slate-900">Quick actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickLink href="#crop-detection" title="Scan crop" />
          <QuickLink href="#farm-mapping" title="Map a farm" />
          <QuickLink href="#farm-reports" title="View farm reports" />
          <QuickLink href="#report" title="Submit damage report" />
        </div>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900">Recent crop scans</h2>
              <p className="mt-1 text-sm text-slate-500">
                Your latest saved crop analyses.
              </p>
            </div>
            <a href="#crop-history" className="text-sm font-bold text-emerald-800">
              View all
            </a>
          </div>

          {loading ? (
            <Loading />
          ) : detections.length ? (
            <div className="space-y-3">
              {detections.slice(0, 4).map(scan => (
                <a
                  key={scan.id}
                  href="#crop-history"
                  className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
                >
                  {scan.image_url && (
                    <img
                      src={scan.image_url}
                      alt=""
                      className="h-12 w-12 rounded-md object-cover"
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-slate-900">
                      {scan.crop_name || "Unknown crop"}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {scan.land_name || "Farm not selected"} · {formatDate(scan.created_at)}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <Empty text="Your saved crop scans will appear here." />
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900">Recent damage reports</h2>
              <p className="mt-1 text-sm text-slate-500">
                Status of your latest submissions.
              </p>
            </div>
            <a href="#my-reports" className="text-sm font-bold text-emerald-800">
              View all
            </a>
          </div>

          {loading ? (
            <Loading />
          ) : reports.length ? (
            <div className="space-y-3">
              {reports.slice(0, 4).map(report => (
                <a
                  key={report.id}
                  href="#my-reports"
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-slate-900">
                      {report.confirmed_damage_type
                        || report.ai_detected_damage_type
                        || "Damage pending"}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {report.land_name || "Farm"} · {formatDate(report.created_at)}
                    </span>
                  </span>
                  <StatusBadge value={report.status} />
                </a>
              ))}
            </div>
          ) : (
            <Empty text="You have not submitted a damage report yet." />
          )}
        </section>
      </div>
    </AppShell>
  );
}

function QuickLink({ href, title }) {
  return (
    <a
      href={href}
      className="rounded-lg border border-emerald-200 p-4 font-bold text-emerald-900 hover:bg-emerald-50"
    >
      {title}
    </a>
  );
}

export function ProfileLandPage({ token, onLogout }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [gpsMessage, setGpsMessage] = useState("");
  const [locating, setLocating] = useState(false);

  const reload = useCallback(async () => {
    try {
      setData(await api("/farmers/me", { token }));
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    }
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  useRealtimeRefresh(token, reload);

  function useGps() {
    if (!navigator.geolocation) {
      setGpsMessage("This device does not support GPS location.");
      return;
    }

    setLocating(true);
    setGpsMessage("");

    navigator.geolocation.getCurrentPosition(
      position => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setGpsMessage(
          `GPS location received; accuracy is about ${Math.round(position.coords.accuracy)} meters.`,
        );
        setLocating(false);
      },
      gpsError => {
        setGpsMessage(
          gpsError.code === gpsError.PERMISSION_DENIED
            ? "Location permission was blocked. Allow location access, then try again."
            : "GPS could not get a location. Move outdoors and try again.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  }

  async function addLand(event) {
    event.preventDefault();

    const form = event.currentTarget;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api("/farmers/lands", {
        token,
        method: "POST",
        body: new FormData(form),
      });

      form.reset();
      setLatitude("");
      setLongitude("");
      setSuccess("Land record saved successfully.");
      await reload();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  const profile = data?.profile;
  const lands = data?.lands || [];

  return (
    <AppShell onLogout={onLogout}>
      <PageHeader
        eyebrow="Farmer portal"
        title="My profile & land"
        description="Review your farmer registration and save land records for damage reports."
      />

      {error && <Message error text={error} />}
      {success && <Message text={success} />}

      <div className="mt-6 grid gap-5 lg:grid-cols-5">
        <section className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            Registration details
          </p>
          <h2 className="mt-2 text-xl font-bold">
            {profile?.full_name || "Your farmer profile"}
          </h2>
          <div className="mt-4">
            <StatusBadge value={profile?.registration_status || "Pending"} />
          </div>

          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-slate-400">Address</dt>
              <dd className="mt-1 text-slate-700">
                {profile?.address || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-400">Barangay</dt>
              <dd className="mt-1 text-slate-700">
                {profile?.barangay || "Not provided"}
              </dd>
            </div>
          </dl>

          <h3 className="mt-7 font-bold text-slate-900">Registered land</h3>
          <div className="mt-3 space-y-3">
            {lands.map(land => (
              <article
                key={land.id}
                className="rounded-lg border border-slate-200 p-3 text-sm"
              >
                <b>{land.name || "Farm land"}</b>
                <p className="mt-1 text-slate-600">
                  {land.size_hectares} hectares ·{" "}
                  {Array.isArray(land.crop_types)
                    ? land.crop_types.join(", ")
                    : land.crop_types}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {land.barangay || "Location not specified"}
                  {land.latitude && land.longitude
                    ? ` · ${land.latitude}, ${land.longitude}`
                    : ""}
                </p>
              </article>
            ))}
            {data && !lands.length && (
              <Empty text="No land registered yet. Add your first land record." />
            )}
          </div>
        </section>

        <form
          onSubmit={addLand}
          className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-3"
        >
          <h2 className="text-xl font-bold text-slate-900">Add a land record</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add each farm once so it can be selected in a damage report.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Land name">
              <input
                name="name"
                className="mt-1 w-full"
                placeholder="Example: Corn field"
              />
            </Field>

            <Field label="Barangay">
              <select name="barangay" required className="mt-1 w-full">
                <option value="">Select Bongabong barangay</option>
                {bongabongBarangays.map(barangay => (
                  <option key={barangay} value={barangay}>
                    {barangay}
                  </option>
                ))}
              </select>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Land address">
                <input
                  name="address"
                  className="mt-1 w-full"
                  placeholder="Sitio, road, or nearby landmark"
                />
              </Field>
            </div>

            <Field label="Size (hectares)">
              <input
                name="sizeHectares"
                type="number"
                min="0.01"
                step="0.01"
                required
                className="mt-1 w-full"
              />
            </Field>

            <Field label="Crop types">
              <input
                name="cropTypes"
                required
                className="mt-1 w-full"
                placeholder="Rice, corn, vegetables"
              />
            </Field>

            <section className="rounded-lg border border-sky-100 bg-sky-50 p-4 sm:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900">Farm GPS location</h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Stand at the farm and use GPS, or enter coordinates manually.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={useGps}
                  disabled={locating}
                  className="rounded-lg bg-sky-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                >
                  {locating ? "Getting GPS…" : "Use my GPS location"}
                </button>
              </div>

              {gpsMessage && (
                <p role="status" className="mt-3 text-xs text-slate-700">
                  {gpsMessage}
                </p>
              )}

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Latitude">
                  <input
                    name="latitude"
                    value={latitude}
                    onChange={event => setLatitude(event.target.value)}
                    type="number"
                    step="any"
                    required
                    className="mt-1 w-full"
                  />
                </Field>
                <Field label="Longitude">
                  <input
                    name="longitude"
                    value={longitude}
                    onChange={event => setLongitude(event.target.value)}
                    type="number"
                    step="any"
                    required
                    className="mt-1 w-full"
                  />
                </Field>
              </div>
            </section>

            <Field label="Ownership or tenancy proof (optional)">
              <input
                name="ownershipProof"
                type="file"
                accept="image/*,.pdf"
                className="mt-1 block w-full"
              />
            </Field>
          </div>

          <button
            disabled={saving}
            className="button mt-5 !w-auto"
          >
            {saving ? "Saving…" : "Save land record"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}

export function DamageReportPage({ token, onLogout }) {
  const [lands, setLands] = useState([]);
  const [cropScans, setCropScans] = useState([]);
  const [scanDraft, setScanDraft] = useState(getReportDraft);
  const [landId, setLandId] = useState(() => getReportDraft()?.landId || "");
  const [confirmedPlant, setConfirmedPlant] = useState(
    () => getReportDraft()?.cropName || "",
  );
  const [confirmedDamageType, setConfirmedDamageType] = useState(
    () => getReportDraft()?.damageType || "",
  );
  const [incidentOccurredAt, setIncidentOccurredAt] = useState(defaultIncidentTime);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setError("");

    try {
      const [farmData, scanData] = await Promise.all([
        api("/farmers/me", { token }),
        api("/crop-detections", { token }),
      ]);

      setLands(farmData.lands || []);
      setCropScans(scanData.detections || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeRefresh(token, load);

  function chooseCropScan(event) {
    const detection = cropScans.find(
      scan => String(scan.id) === event.target.value,
    );

    if (!detection) {
      sessionStorage.removeItem("agrisystem-report-draft");
      setScanDraft(null);
      setConfirmedPlant("");
      setConfirmedDamageType("");
      return;
    }

    const analysis = detection.analysis || {};
    const suggestedDamage = damageTypes.find(
      type => type.toLowerCase()
        === String(analysis.possibleDamageType || "").toLowerCase(),
    ) || "";

    const draft = {
      id: detection.id,
      landId: detection.land_id ? String(detection.land_id) : "",
      cropName: detection.crop_name || "",
      confidence: detection.confidence,
      damageType: suggestedDamage,
      photoUrl: detection.image_url,
    };

    sessionStorage.setItem("agrisystem-report-draft", JSON.stringify(draft));
    setScanDraft(draft);
    setLandId(draft.landId);
    setConfirmedPlant(draft.cropName);
    setConfirmedDamageType(suggestedDamage);
  }

  async function submit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const body = new FormData(form);
    const photos = body.getAll("photos").filter(
      file => file instanceof File && file.size > 0,
    );
    const allowedTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);

    setSending(true);
    setError("");
    setMessage("");

    try {
      if (!photos.length && !scanDraft?.id) {
        throw new Error(
          "Choose a saved crop scan or upload at least one farm photo.",
        );
      }
      if (photos.length > 5) {
        throw new Error("Upload a maximum of five farm photos.");
      }
      if (photos.some(file => !allowedTypes.has(file.type))) {
        throw new Error("Upload JPG, PNG, or WebP farm photos only.");
      }
      if (photos.some(file => file.size > 8 * 1024 * 1024)) {
        throw new Error("Each farm photo must be 8 MB or smaller.");
      }

      await api("/reports", {
        token,
        method: "POST",
        body,
      });

      setMessage("Your damage report was sent to the MAO for review.");
      sessionStorage.removeItem("agrisystem-report-draft");
      setScanDraft(null);
      setLandId("");
      setConfirmedPlant("");
      setConfirmedDamageType("");
      setIncidentOccurredAt(defaultIncidentTime());
      form.reset();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSending(false);
    }
  }

  const selectedLand = lands.find(
    land => String(land.id) === String(landId),
  );

  return (
    <AppShell onLogout={onLogout}>
      <PageHeader
        eyebrow="Farmer portal"
        title="Submit a damage report"
        description="Send a suspected farm damage incident and its evidence to MAO for staff review."
      />

      {error && <Message error text={error} />}
      {message && <Message text={message} />}

      {loading ? (
        <div className="mt-6">
          <Loading />
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="mx-auto mt-6 grid w-full max-w-4xl gap-5 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 sm:p-7"
        >
          <Field label="Link a saved crop scan (optional)">
            <select
              value={scanDraft?.id || ""}
              onChange={chooseCropScan}
              className="mt-1 w-full"
            >
              <option value="">No scan — upload report photos instead</option>
              {cropScans.map(scan => (
                <option key={scan.id} value={scan.id}>
                  {scan.crop_name || "Unknown crop"} ·{" "}
                  {scan.land_name || "No farm linked"}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Registered land">
            <select
              name="landId"
              required
              value={landId}
              onChange={event => setLandId(event.target.value)}
              className="mt-1 w-full"
            >
              <option value="">Select your land</option>
              {lands.map(land => (
                <option key={land.id} value={land.id}>
                  {land.name || "Farm land"} — {land.barangay || "Barangay not set"}
                </option>
              ))}
            </select>
          </Field>

          {scanDraft?.id && (
            <input
              type="hidden"
              name="cropDetectionId"
              value={scanDraft.id}
            />
          )}

          <Field label="Land barangay">
            <select
              name="incidentBarangay"
              required
              defaultValue={selectedLand?.barangay || ""}
              key={selectedLand?.id || "no-land"}
              className="mt-1 w-full"
            >
              <option value="">Select Bongabong barangay</option>
              {bongabongBarangays.map(barangay => (
                <option key={barangay} value={barangay}>
                  {barangay}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Affected crop">
            <select
              name="confirmedPlant"
              required
              value={confirmedPlant}
              onChange={event => setConfirmedPlant(event.target.value)}
              className="mt-1 w-full"
            >
              <option value="">Select affected crop</option>
              {["Rice", "Corn", "Coconut", "Vegetables", "Other"].map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
              {confirmedPlant
                && !["Rice", "Corn", "Coconut", "Vegetables", "Other"].includes(confirmedPlant)
                && <option value={confirmedPlant}>{confirmedPlant}</option>}
            </select>
          </Field>

          <Field label="Damage type">
            <select
              name="confirmedDamageType"
              required
              value={confirmedDamageType}
              onChange={event => setConfirmedDamageType(event.target.value)}
              className="mt-1 w-full"
            >
              <option value="">Select damage type</option>
              {damageTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </Field>

          <Field label="Observed severity">
            <select
              name="reportedSeverity"
              required
              className="mt-1 w-full"
              defaultValue=""
            >
              <option value="">Select severity</option>
              <option>Low</option>
              <option>Moderate</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </Field>

          <Field label="When did it happen?">
            <input
              name="incidentOccurredAt"
              type="datetime-local"
              required
              value={incidentOccurredAt}
              onChange={event => setIncidentOccurredAt(event.target.value)}
              className="mt-1 w-full"
            />
          </Field>

          <Field label="Estimated affected area (optional)">
            <input
              name="reportedAffectedArea"
              maxLength="180"
              className="mt-1 w-full"
              placeholder="Example: approximately 0.5 hectare"
            />
          </Field>

          <Field label="Incident latitude (optional)">
            <input
              name="latitude"
              type="number"
              step="any"
              className="mt-1 w-full"
            />
          </Field>

          <Field label="Incident longitude (optional)">
            <input
              name="longitude"
              type="number"
              step="any"
              className="mt-1 w-full"
            />
          </Field>

          <Field label="Farm photo evidence (up to 5 photos)">
            <input
              name="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="mt-1 block w-full"
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Incident description">
              <textarea
                name="farmerNotes"
                required
                rows="5"
                className="mt-1 w-full"
                placeholder="Describe what happened, when it happened, and the affected area."
              />
            </Field>
          </div>

          {scanDraft?.photoUrl && (
            <img
              src={scanDraft.photoUrl}
              alt="Linked crop scan"
              className="max-h-72 rounded-lg border border-slate-200 object-contain sm:col-span-2"
            />
          )}

          <div className="sm:col-span-2">
            <button
              disabled={sending || !lands.length}
              className="button !w-auto"
            >
              {sending ? "Submitting…" : "Submit report for MAO review"}
            </button>
            {!lands.length && (
              <p className="mt-3 text-sm text-amber-700">
                Add a land record first before submitting a report.
              </p>
            )}
          </div>
        </form>
      )}
    </AppShell>
  );
}

export function MyReportsPage({ token, onLogout }) {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await api("/reports/mine", { token });
      setReports(data.reports || []);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeRefresh(token, load);

  const filtered = reports.filter(report => {
    const searchable = [
      report.id,
      report.land_name,
      report.barangay,
      report.confirmed_plant,
      report.ai_detected_plant,
      report.confirmed_damage_type,
      report.ai_detected_damage_type,
    ].filter(Boolean).join(" ").toLowerCase();

    const matchesStatus = status === "all"
      || report.status === status
      || (status === "resolved" && report.status === "verified");

    return matchesStatus && searchable.includes(query.toLowerCase());
  });

  function exportCsv() {
    const rows = [
      ["Report ID", "Submitted", "Farm", "Barangay", "Crop", "Damage", "Status"],
      ...filtered.map(report => [
        `DR-${String(report.id).padStart(6, "0")}`,
        formatDate(report.created_at),
        report.land_name || "",
        report.barangay || "",
        report.confirmed_plant || report.ai_detected_plant || "",
        report.confirmed_damage_type || report.ai_detected_damage_type || "",
        report.status || "",
      ]),
    ];

    const csv = rows
      .map(row => row.map(value => (
        `"${String(value ?? "").replace(/"/g, '""')}"`
      )).join(","))
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `farm-damage-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell onLogout={onLogout}>
      <PageHeader
        eyebrow="Farmer portal"
        title="My damage reports"
        description="Search your submitted reports and check their MAO review status."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportCsv}
              disabled={!filtered.length}
              className="rounded-lg border border-emerald-700 px-4 py-2 text-sm font-bold text-emerald-800 disabled:opacity-50"
            >
              Export CSV
            </button>
            <a href="#report" className="button !w-auto">
              New report
            </a>
          </div>
        }
      />

      {error && <Message error text={error} />}

      <section className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <Field label="Search reports">
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            className="mt-1 w-full"
            placeholder="Report ID, farm, crop, or damage"
          />
        </Field>

        <Field label="Review status">
          <select
            value={status}
            onChange={event => setStatus(event.target.value)}
            className="mt-1 w-full"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </Field>
      </section>

      <div className="mt-5 space-y-4">
        {filtered.map(report => (
          <article
            key={report.id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <div className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <StatusBadge value={report.status} />
                  <h2 className="mt-3 font-bold text-slate-900">
                    {report.confirmed_plant
                      || report.ai_detected_plant
                      || "Crop identification pending"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {report.confirmed_damage_type
                      || report.ai_detected_damage_type
                      || "Damage assessment pending"}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {report.land_name || "Farm land"} ·{" "}
                    {report.barangay || "Location not provided"} ·{" "}
                    {formatDate(report.created_at)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setExpanded(
                    expanded === report.id ? null : report.id,
                  )}
                  className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-bold text-emerald-800"
                >
                  {expanded === report.id ? "Hide details" : "View details"}
                </button>
              </div>

              {expanded === report.id && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {report.farmer_notes || "No additional notes provided."}
                  </p>

                  {report.staff_remarks && (
                    <p className="mt-3 rounded-lg bg-sky-50 p-3 text-sm text-sky-900">
                      <b>MAO feedback:</b> {report.staff_remarks}
                    </p>
                  )}

                  {report.photos?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {report.photos.map(photo => (
                        <a
                          key={photo.id}
                          href={photo.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            src={photo.fileUrl}
                            alt="Damage report evidence"
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </article>
        ))}

        {!filtered.length && (
          <Empty
            text={reports.length
              ? "No reports match your search or filter."
              : "You have not submitted a damage report yet."}
          />
        )}
      </div>
    </AppShell>
  );
}

export function NotificationsPage({ token, onLogout }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api("/notifications/mine", { token });
      setItems(data.notifications || []);
      setError("");

      const unread = (data.notifications || []).filter(item => !item.read_at);
      await Promise.all(
        unread.map(item => api(`/notifications/${item.id}/read`, {
          token,
          method: "PATCH",
        })),
      );

      setItems(current => current.map(item => (
        item.read_at
          ? item
          : { ...item, read_at: new Date().toISOString() }
      )));
    } catch (loadError) {
      setError(loadError.message);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeRefresh(token, load);

  return (
    <AppShell onLogout={onLogout}>
      <PageHeader
        eyebrow="Farmer portal"
        title="My notifications"
        description="Updates from the MAO about your reports, assistance, and farm-related alerts."
      />

      {error && <Message error text={error} />}

      <div className="mt-6 space-y-3">
        {items.map(item => (
          <article
            key={item.id}
            className={`rounded-lg border bg-white p-5 shadow-sm ${
              item.read_at
                ? "border-slate-100"
                : "border-emerald-200 ring-2 ring-emerald-50"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <StatusBadge value={item.type} />
                {!item.read_at && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
                    New
                  </span>
                )}
              </div>
              <time className="text-xs text-slate-400">
                {formatDate(item.created_at)}
              </time>
            </div>
            <p className="mt-3 leading-6 text-slate-700">{item.message}</p>
          </article>
        ))}

        {!items.length && (
          <Empty text="No notifications yet. MAO updates will appear here." />
        )}
      </div>
    </AppShell>
  );
}

export function WeatherPage({ token, onLogout }) {
  return (
    <AppShell onLogout={onLogout}>
      <PageHeader
        eyebrow="Farmer portal"
        title="Weather condition"
        description="Allow your browser to use GPS and see the weather where you are. Your current location is used for the forecast and is not saved to your farm record."
      />
      <div className="mx-auto mt-6 w-full max-w-3xl">
        <BongabongWeather token={token} />
      </div>
    </AppShell>
  );
}