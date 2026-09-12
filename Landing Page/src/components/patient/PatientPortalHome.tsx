import { useState, useMemo, useCallback, useEffect } from 'react';
import { DoctorProfile, fetchDoctors } from '../../lib/live-data';
import { formatPHP } from '../../lib/currency';
import { Search, MapPin, Star, Filter, ChevronDown, Stethoscope, Clock3 } from 'lucide-react';

interface PatientPortalHomeProps {
  onBookDoctor: (doctorId: string) => void;
}

/* ── Haversine distance (km) ─────────────────────────────────────── */
function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ── Payment method labels ───────────────────────────────────────── */
const paymentLabel: Record<string, string> = {
  cash: 'Cash',
  card: 'Card',
  gcash: 'GCash',
  maya: 'Maya',
  bank_transfer: 'Bank Transfer',
  insurance: 'Insurance',
};

/* ── Avatar color palette ────────────────────────────────────────── */
const avatarColors = [
  '#0D6E6E',
  '#FF6B6B',
  '#3B82F6',
  '#8B5CF6',
  '#F59E0B',
  '#10B981',
];
function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function PatientPortalHome({ onBookDoctor }: PatientPortalHomeProps) {
  /* ── State ───────────────────────────────────────────────────── */
  const [searchText, setSearchText] = useState('');
  const [locationText, setLocationText] = useState('Near me');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [specialtyOpen, setSpecialtyOpen] = useState(false);
  const [acceptsInsurance, setAcceptsInsurance] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctors()
      .then(setDoctors)
      .catch((loadError: Error) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const allSpecialties = useMemo(
    () => Array.from(new Set(doctors.flatMap((doctor) => doctor.specialties))).sort(),
    [doctors],
  );

  /* ── Geolocation ─────────────────────────────────────────────── */
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationText('Current location');
        setGeoLoading(false);
      },
      () => {
        setGeoError('Unable to retrieve your location.');
        setGeoLoading(false);
      },
    );
  }, []);

  /* ── Compute distances ───────────────────────────────────────── */
  const doctorsWithDistance = useMemo(() => {
    return doctors.map((doc) => ({
      ...doc,
      distance: userCoords
        ? haversineKm(userCoords.lat, userCoords.lng, doc.latitude, doc.longitude)
        : null,
    }));
  }, [doctors, userCoords]);

  /* ── Filter + sort ───────────────────────────────────────────── */
  const results = useMemo(() => {
    let list = doctorsWithDistance;

    // text search
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (d) =>
          d.fullName.toLowerCase().includes(q) ||
          d.specialties.some((s) => s.toLowerCase().includes(q)) ||
          d.clinicName.toLowerCase().includes(q),
      );
    }

    // specialty filter
    if (selectedSpecialty) {
      list = list.filter((d) => d.specialties.includes(selectedSpecialty));
    }

    // insurance filter
    if (acceptsInsurance) {
      list = list.filter((d) => d.acceptedPaymentMethods.includes('insurance'));
    }

    // availability filter
    if (availableOnly) {
      list = list.filter((d) => d.isAcceptingPatients);
    }

    // sort by distance when available, otherwise by rating
    if (userCoords) {
      list = [...list].sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    } else {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [doctorsWithDistance, searchText, selectedSpecialty, acceptsInsurance, availableOnly, userCoords]);

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#F8FAFB]">
      {/* ── Header / search bar ──────────────────────────────── */}
      <div className="bg-white border-b border-[#e5ebed]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0D6E6E] text-white">
              <Stethoscope size={19} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1A2B3C]">Find a Doctor</h1>
              <p className="text-xs text-[#607181]">Browse clinics and book appointments</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* search input */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa8b0]"
              />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search doctor, specialty, or clinic..."
                className="w-full rounded-xl border border-[#dce8e8] py-2.5 pl-9 pr-3.5 text-sm text-[#1A2B3C] placeholder:text-[#9aa8b0] focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20"
              />
            </div>

            {/* location input */}
            <div className="relative flex min-w-[220px] items-center gap-1">
              <div className="relative flex-1">
                <MapPin
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa8b0]"
                />
                <input
                  type="text"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  className="w-full rounded-xl border border-[#dce8e8] py-2.5 pl-9 pr-3.5 text-sm text-[#1A2B3C] placeholder:text-[#9aa8b0] focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/20"
                />
              </div>
              <button
                type="button"
                onClick={requestLocation}
                disabled={geoLoading}
                className="shrink-0 rounded-xl border border-[#dce8e8] bg-white px-3 py-2.5 text-xs font-semibold text-[#0D6E6E] hover:bg-[#f2fafa] disabled:opacity-50"
              >
                {geoLoading ? 'Locating...' : 'Use my location'}
              </button>
            </div>
          </div>

          {geoError && (
            <p className="mt-2 text-xs text-red-500">{geoError}</p>
          )}
        </div>
      </div>

      {/* ── Filter chips ─────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          {/* specialty dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSpecialtyOpen(!specialtyOpen)}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedSpecialty
                  ? 'border-[#0D6E6E] bg-[#e5f4f3] text-[#0D6E6E]'
                  : 'border-[#dce8e8] bg-white text-[#607181] hover:border-[#0D6E6E] hover:text-[#0D6E6E]'
              }`}
            >
              <Filter size={13} />
              {selectedSpecialty || 'Specialty'}
              <ChevronDown size={13} />
            </button>

            {specialtyOpen && (
              <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-xl border border-[#e5ebed] bg-white py-1 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
                <button
                  type="button"
                  onClick={() => { setSelectedSpecialty(null); setSpecialtyOpen(false); }}
                  className={`block w-full px-4 py-2 text-left text-xs ${
                    !selectedSpecialty ? 'font-bold text-[#0D6E6E]' : 'text-[#607181] hover:bg-[#f8fafb]'
                  }`}
                >
                  All Specialties
                </button>
                {allSpecialties.map((spec) => (
                  <button
                    type="button"
                    key={spec}
                    onClick={() => { setSelectedSpecialty(spec); setSpecialtyOpen(false); }}
                    className={`block w-full px-4 py-2 text-left text-xs ${
                      selectedSpecialty === spec
                        ? 'font-bold text-[#0D6E6E]'
                        : 'text-[#607181] hover:bg-[#f8fafb]'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* insurance chip */}
          <button
            type="button"
            onClick={() => setAcceptsInsurance(!acceptsInsurance)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              acceptsInsurance
                ? 'border-[#0D6E6E] bg-[#e5f4f3] text-[#0D6E6E]'
                : 'border-[#dce8e8] bg-white text-[#607181] hover:border-[#0D6E6E] hover:text-[#0D6E6E]'
            }`}
          >
            Accepts Insurance
          </button>

          {/* availability chip */}
          <button
            type="button"
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              availableOnly
                ? 'border-[#0D6E6E] bg-[#e5f4f3] text-[#0D6E6E]'
                : 'border-[#dce8e8] bg-white text-[#607181] hover:border-[#0D6E6E] hover:text-[#0D6E6E]'
            }`}
          >
            <Clock3 size={13} />
            Accepting Patients
          </button>

          {/* result count */}
          <span className="ml-auto text-xs text-[#607181]">
            {results.length} doctor{results.length !== 1 && 's'} found
          </span>
        </div>
      </div>

      {/* ── Results grid ─────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="rounded-2xl border border-[#e5ebed] bg-white py-16 text-center text-sm text-[#607181]">Loading doctors...</div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-white py-16 text-center text-sm text-red-600">Unable to load doctors: {error}</div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e5ebed] bg-white py-16 text-center">
            <Stethoscope size={40} className="mb-3 text-[#dce8e8]" />
            <p className="text-sm font-semibold text-[#1A2B3C]">No doctors found</p>
            <p className="mt-1 text-xs text-[#607181]">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((doc) => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                distance={doc.distance}
                onBook={() => onBookDoctor(doc.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Doctor card ──────────────────────────────────────────────────── */
function DoctorCard({
  doctor,
  distance,
  onBook,
}: {
  doctor: DoctorProfile;
  distance: number | null;
  onBook: () => void;
}) {
  return (
    <div onClick={onBook} className="flex cursor-pointer flex-col rounded-2xl border border-[#e5ebed] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)] transition hover:shadow-[0_4px_24px_rgba(0,0,0,0.10)]">
      <div className="flex gap-3.5 p-5 pb-3">
        {/* avatar */}
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: avatarColor(doctor.id) }}
        >
          {doctor.initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[#1A2B3C]">{doctor.fullName}</p>

          {/* specialties */}
          <div className="mt-1 flex flex-wrap gap-1">
            {doctor.specialties.map((s) => (
              <span
                key={s}
                className="inline-block rounded-md bg-[#e5f4f3] px-2 py-0.5 text-[10px] font-semibold text-[#0D6E6E]"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* clinic + distance */}
      <div className="px-5 pb-3">
        <p className="text-xs font-medium text-[#1A2B3C]">{doctor.clinicName}</p>
        <div className="mt-0.5 flex items-start gap-1 text-[11px] text-[#607181]">
          <MapPin size={12} className="mt-px shrink-0" />
          <span className="leading-[1.35]">
            {doctor.clinicAddress}
            {distance !== null && (
              <span className="ml-1 font-semibold text-[#0D6E6E]">
                &middot; {distance.toFixed(1)} km
              </span>
            )}
          </span>
        </div>
      </div>

      {/* rating + fee */}
      <div className="mt-auto flex items-center justify-between border-t border-[#f0f3f5] px-5 py-3">
        <div className="flex items-center gap-1.5">
          <Star size={13} className="fill-[#F59E0B] text-[#F59E0B]" />
          <span className="text-xs font-bold text-[#1A2B3C]">{doctor.rating.toFixed(1)}</span>
          <span className="text-[11px] text-[#607181]">({doctor.reviewCount})</span>
        </div>
        <span className="text-xs font-bold text-[#0D6E6E]">
          {formatPHP(doctor.consultationFeeCents)}
        </span>
      </div>

      {/* book button */}
      <div className="px-5 pb-5">
        <button
          type="button"
          onClick={onBook}
          className="w-full rounded-xl bg-[#0D6E6E] py-2.5 text-xs font-bold text-white shadow-[0_6px_16px_rgba(13,110,110,0.18)] transition hover:bg-[#095a5a]"
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
}
