import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Plane, Hotel, Utensils, Search, ExternalLink, Star, Calendar as CalendarIcon, Users, MapPin, Loader2,
  Train, Bus, Car, Clock, ArrowRightLeft, ArrowRight, BedDouble, ShieldCheck, TrendingDown, AlertCircle, SearchX,
} from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'sonner';
import PageHero from '../components/PageHero';
import { IMG } from '../data/travelImages';
import { Navbar, Footer } from '../components/Layout';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { cn } from '../lib/utils';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const ISO = (d) => format(d, 'yyyy-MM-dd');

const TABS = [
  { id: 'flights', label: 'Flights', icon: Plane, type: 'flight' },
  { id: 'hotels', label: 'Hotels', icon: Hotel, type: 'hotel' },
  { id: 'transport', label: 'Transport', icon: Train, type: 'transport' },
  { id: 'restaurants', label: 'Dining', icon: Utensils, type: 'restaurant' },
];

// Desktop column spans (out of 12) so every tab's fields fill the row.
const SPANS = {
  flightsOne: { origin: 'lg:col-span-3', dest: 'lg:col-span-3', date: 'lg:col-span-3', ret: '', guests: 'lg:col-span-3' },
  flightsRound: { origin: 'lg:col-span-3', dest: 'lg:col-span-3', date: 'lg:col-span-2', ret: 'lg:col-span-2', guests: 'lg:col-span-2' },
  hotels: { dest: 'lg:col-span-3', date: 'lg:col-span-3', ret: 'lg:col-span-2', guests: 'lg:col-span-2', rooms: 'lg:col-span-2' },
  transport: { dest: 'lg:col-span-4', date: 'lg:col-span-4', guests: 'lg:col-span-4' },
  restaurants: { dest: 'lg:col-span-3', date: 'lg:col-span-2', guests: 'lg:col-span-2', cuisine: 'lg:col-span-3', budget: 'lg:col-span-2' },
};

const inputCls = 'w-full h-14 rounded-2xl border border-border bg-background pl-11 pr-4 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 placeholder:text-muted-foreground';

const Field = ({ label, icon: Icon, children, className }) => (
  <label className={cn('block', className)}>
    <span className="block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">{label}</span>
    <span className="relative block">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-primary pointer-events-none" />
      {children}
    </span>
  </label>
);

const DateField = ({ label, value, onChange, disabled, className }) => (
  <div className={className}>
    <span className="block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">{label}</span>
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={cn(inputCls, 'relative text-left flex items-center', !value && 'text-muted-foreground')}>
          <CalendarIcon className="absolute left-4 w-[18px] h-[18px] text-primary" />
          {value ? format(value, 'EEE, MMM d, yyyy') : 'Select date'}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl">
        <Calendar mode="single" selected={value} onSelect={onChange} disabled={disabled} initialFocus />
      </PopoverContent>
    </Popover>
  </div>
);

const Segmented = ({ options, value, onChange, label }) => (
  <div role="group" aria-label={label} className="inline-flex rounded-full bg-muted p-1">
    {options.map((o) => (
      <button key={o.value} type="button" onClick={() => onChange(o.value)} aria-pressed={value === o.value}
        className={cn('px-4 py-1.5 rounded-full text-sm font-semibold transition', value === o.value ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:text-foreground')}>
        {o.label}
      </button>
    ))}
  </div>
);

const PriceBlock = ({ amount, currency, best, perPerson }) => {
  const { formatAmount } = useCurrency();
  return (
    <div className="text-right shrink-0">
      <p className={cn('font-extrabold tracking-tight', best ? 'text-3xl text-primary' : 'text-2xl')}>{formatAmount(amount, currency)}</p>
      {perPerson && <p className="text-xs text-muted-foreground">per person</p>}
    </div>
  );
};

const FlightCard = ({ flight, best }) => {
  const time = (t) => t?.split('T')[1]?.slice(0, 5) || '--:--';
  return (
    <a href={flight.booking_url} target="_blank" rel="noopener noreferrer"
      className={cn('group block rounded-3xl border bg-card p-5 sm:p-6 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/10', best ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border')}>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="font-bold">{flight.validating_airline || flight.segments?.[0]?.airline_code || 'Flight'}</span>
        <span className={cn('text-xs font-bold rounded-full px-2.5 py-1', flight.is_direct ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400')}>
          {flight.is_direct ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
        </span>
        {best && <span className="text-xs font-bold rounded-full px-2.5 py-1 bg-primary text-primary-foreground inline-flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Best price</span>}
        {flight.booking_class && <span className="text-xs text-muted-foreground capitalize ml-auto">{flight.booking_class.toLowerCase()}</span>}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex-1 flex items-center gap-4">
          <div className="text-center min-w-[64px]">
            <p className="text-2xl font-extrabold">{time(flight.departure_time)}</p>
            <p className="text-sm font-semibold text-muted-foreground">{flight.departure_airport}</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{flight.total_duration}</span>
            <div className="w-full flex items-center gap-1.5">
              <span className="h-px flex-1 bg-border" />
              {flight.connections?.slice(0, 2).map((c, i) => <span key={i} className="w-2 h-2 rounded-full bg-amber-500" title={c.airport} />)}
              <Plane className="w-4 h-4 text-primary shrink-0" />
              <span className="h-px flex-1 bg-border" />
            </div>
            {flight.connections?.length > 0 && <span className="text-[11px] text-muted-foreground truncate max-w-full">via {flight.connections.slice(0, 2).map((c) => c.airport).join(', ')}</span>}
          </div>
          <div className="text-center min-w-[64px]">
            <p className="text-2xl font-extrabold">{time(flight.arrival_time)}</p>
            <p className="text-sm font-semibold text-muted-foreground">{flight.arrival_airport}</p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 sm:pl-6 sm:border-l border-border">
          <PriceBlock amount={flight.price} currency={flight.currency} best={best} perPerson />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold px-4 py-2 group-hover:gap-2.5 transition-all">
            View deal <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
};

const ResultIcon = ({ tab, result }) => {
  const t = result.details?.transport_type;
  const Icon = tab === 'hotels' ? BedDouble : tab === 'restaurants' ? Utensils : t === 'train' ? Train : t === 'bus' ? Bus : Car;
  return <Icon className="w-7 h-7 text-primary" />;
};

const ResultCard = ({ result, tab }) => (
  <a href={result.url} target="_blank" rel="noopener noreferrer"
    className={cn('group flex gap-4 sm:gap-6 rounded-3xl border bg-card p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/10', result.is_lowest ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border')}>
    {result.image ? (
      <img src={result.image} alt="" loading="lazy" className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl object-cover shrink-0" />
    ) : (
      <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0"><ResultIcon tab={tab} result={result} /></div>
    )}
    <div className="flex-1 min-w-0 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-lg leading-snug line-clamp-2">{result.name}</h3>
          {result.rating && <span className="inline-flex items-center gap-1 text-sm font-bold shrink-0"><Star className="w-4 h-4 fill-amber-400 text-amber-400" />{result.rating}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {result.is_lowest && <span className="text-xs font-bold rounded-full px-2.5 py-1 bg-primary text-primary-foreground inline-flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Lowest price</span>}
          {result.provider && <span className="text-sm text-muted-foreground">{result.provider}</span>}
        </div>
        {result.details?.address && <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1 line-clamp-1"><MapPin className="w-3.5 h-3.5 shrink-0" />{result.details.address}</p>}
        {result.details?.note && <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{result.details.note}</p>}
      </div>
      <div className="flex items-end justify-between gap-3 mt-3">
        {result.price > 0 ? <PriceBlock amount={result.price} currency={result.currency || 'USD'} best={result.is_lowest} /> : <span className="text-sm text-muted-foreground">Price on provider site</span>}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold px-4 py-2">View <ExternalLink className="w-3.5 h-3.5" /></span>
      </div>
    </div>
  </a>
);

const Skeletons = () => (
  <div className="grid gap-4" aria-busy="true" aria-label="Searching">
    {[0, 1, 2].map((i) => (
      <div key={i} className="rounded-3xl border border-border bg-card p-6 animate-pulse">
        <div className="h-4 w-32 rounded bg-muted mb-5" />
        <div className="flex items-center gap-6"><div className="h-10 w-16 rounded bg-muted" /><div className="h-2 flex-1 rounded bg-muted" /><div className="h-10 w-16 rounded bg-muted" /><div className="h-12 w-28 rounded-xl bg-muted ml-4" /></div>
      </div>
    ))}
  </div>
);

const BookingPage = () => {
  const location = useLocation();
  const { token } = useAuth();
  const { formatAmount } = useCurrency();
  const [tab, setTab] = useState('flights');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flightResults, setFlightResults] = useState(null);
  const [results, setResults] = useState(null);
  const [searchedTab, setSearchedTab] = useState(null);
  const [sort, setSort] = useState('price');
  const [directOnly, setDirectOnly] = useState(false);
  const [f, setF] = useState({
    tripType: 'ONE_WAY', origin: '', destination: location.state?.destination || '',
    date: undefined, returnDate: undefined, adults: 1, rooms: 1, cuisine: '', priceRange: 'all',
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const sp = SPANS[tab === 'flights' ? (f.tripType === 'ROUND_TRIP' ? 'flightsRound' : 'flightsOne') : tab];
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fail = (msg) => { toast.error(msg); return false; };

  const validate = () => {
    if (!f.destination.trim()) return fail('Please enter a destination');
    if (tab === 'flights' && !f.origin.trim()) return fail('Please enter where you are flying from');
    if (!f.date) return fail(tab === 'hotels' ? 'Please choose a check-in date' : 'Please choose a date');
    if (tab === 'hotels' && !f.returnDate) return fail('Please choose a check-out date');
    if (tab === 'flights' && f.tripType === 'ROUND_TRIP' && !f.returnDate) return fail('Please choose a return date');
    return true;
  };

  const search = async (e) => {
    e?.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    setFlightResults(null);
    setResults(null);
    setSearchedTab(tab);
    try {
      if (tab === 'flights') {
        const { data } = await axios.post(`${API}/flights/search`, {
          origin: f.origin.trim(), destination: f.destination.trim(),
          trip_type: f.tripType, departure_date: ISO(f.date),
          return_date: f.tripType === 'ROUND_TRIP' ? ISO(f.returnDate) : null,
          adults: f.adults, non_stop: directOnly,
        }, { headers });
        setFlightResults(data);
      } else {
        const { data } = await axios.post(`${API}/booking/search`, {
          type: TABS.find((t) => t.id === tab).type, destination: f.destination.trim(),
          check_in: ISO(f.date), check_out: f.returnDate ? ISO(f.returnDate) : null,
          guests: f.adults, rooms: f.rooms, cuisine: f.cuisine, price_range: f.priceRange,
        }, { headers });
        setResults(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'We could not complete the search. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const flights = useMemo(() => {
    let list = flightResults?.flights || [];
    if (directOnly) list = list.filter((x) => x.is_direct);
    return [...list].sort((a, b) => (sort === 'stops' ? (a.stops - b.stops) || (a.price - b.price) : a.price - b.price));
  }, [flightResults, sort, directOnly]);

  const otherResults = useMemo(() => [...(results || [])].sort((a, b) => (a.price || Infinity) - (b.price || Infinity)), [results]);
  const hasResults = flightResults || results;
  const noFlights = flightResults && flights.length === 0;
  const noOthers = results && results.length === 0;

  return (
    <div className="min-h-screen flex flex-col" data-testid="booking-page">
      <Navbar />
      <PageHero image={IMG.plane(1920)} eyebrow="Book travel" title="Search, compare, and go" subtitle="Flights, hotels, transport and dining from trusted providers, side by side." />

      <main className="flex-1 pb-20">
        <div className="container-main -mt-10 relative z-10">
          {/* Search panel */}
          <form onSubmit={search} className="rounded-[2rem] border border-border bg-card/95 backdrop-blur p-4 sm:p-6 shadow-2xl shadow-primary/10">
            <div role="tablist" aria-label="What are you looking for" className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-muted mb-6">
              {TABS.map((t) => (
                <button key={t.id} type="button" role="tab" aria-label={t.label} aria-selected={tab === t.id}
                  onClick={() => { setTab(t.id); setError(null); }}
                  className={cn('flex items-center justify-center gap-2 py-3 rounded-xl text-sm sm:text-base font-bold transition', tab === t.id ? 'brand-gradient text-white shadow-md shadow-primary/30' : 'text-muted-foreground hover:text-foreground')}>
                  <t.icon className="w-[18px] h-[18px]" /> <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>

            {tab === 'flights' && (
              <div className="flex flex-wrap items-center gap-4 mb-5">
                <Segmented label="Trip type" value={f.tripType} onChange={(v) => setF((p) => ({ ...p, tripType: v }))} options={[{ value: 'ONE_WAY', label: 'One way' }, { value: 'ROUND_TRIP', label: 'Round trip' }]} />
                <label className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input type="checkbox" checked={directOnly} onChange={(e) => setDirectOnly(e.target.checked)} className="accent-[#7C3AED]" style={{ width: 18, height: 18, minHeight: 0 }} /> Direct flights only
                </label>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
              {tab === 'flights' && (
                <Field label="From" icon={Plane} className={sp.origin}>
                  <input value={f.origin} onChange={set('origin')} placeholder="City or airport" className={inputCls} autoComplete="off" />
                </Field>
              )}
              <Field label={tab === 'flights' ? 'To' : 'Destination'} icon={MapPin} className={sp.dest}>
                <input value={f.destination} onChange={set('destination')} placeholder="Where to?" className={inputCls} autoComplete="off" />
              </Field>
              <DateField className={sp.date}
                label={tab === 'flights' ? 'Departure' : tab === 'hotels' ? 'Check-in' : 'Date'}
                value={f.date} onChange={(d) => setF((p) => ({ ...p, date: d, returnDate: p.returnDate && d && p.returnDate < d ? undefined : p.returnDate }))}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} />
              {(tab === 'hotels' || (tab === 'flights' && f.tripType === 'ROUND_TRIP')) && (
                <DateField className={sp.ret} label={tab === 'hotels' ? 'Check-out' : 'Return'} value={f.returnDate}
                  onChange={(d) => setF((p) => ({ ...p, returnDate: d }))} disabled={(d) => d <= (f.date || new Date())} />
              )}
              <Field label={tab === 'flights' ? 'Travelers' : 'Guests'} icon={Users} className={sp.guests}>
                <input type="number" min="1" max="9" value={f.adults} onChange={(e) => setF((p) => ({ ...p, adults: Math.max(1, Math.min(9, parseInt(e.target.value, 10) || 1)) }))} className={inputCls} />
              </Field>
              {tab === 'hotels' && (
                <Field label="Rooms" icon={BedDouble} className={sp.rooms}>
                  <input type="number" min="1" max="9" value={f.rooms} onChange={(e) => setF((p) => ({ ...p, rooms: Math.max(1, parseInt(e.target.value, 10) || 1) }))} className={inputCls} />
                </Field>
              )}
              {tab === 'restaurants' && (
                <>
                  <Field label="Cuisine (optional)" icon={Utensils} className={sp.cuisine}>
                    <input value={f.cuisine} onChange={set('cuisine')} placeholder="e.g. Italian" className={inputCls} />
                  </Field>
                  <label className={cn('block', sp.budget)}>
                    <span className="block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">Budget</span>
                    <select value={f.priceRange} onChange={set('priceRange')} className={cn(inputCls, 'pl-4')}>
                      <option value="all">Any</option><option value="budget">Budget</option><option value="mid-range">Mid-range</option><option value="luxury">Luxury</option>
                    </select>
                  </label>
                </>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl brand-gradient text-white font-bold text-lg px-10 h-14 shadow-lg shadow-primary/30 hover:brightness-110 disabled:opacity-60 transition">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Searching…</> : <><Search className="w-5 h-5" /> Search {TABS.find((t) => t.id === tab).label.toLowerCase()}</>}
            </button>
          </form>

          {/* Results */}
          <section className="mt-10" aria-live="polite">
            {loading && <Skeletons />}

            {error && !loading && (
              <div role="alert" className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 flex gap-4 items-start">
                <AlertCircle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
                <div><p className="font-bold">Search failed</p><p className="text-muted-foreground">{error}</p></div>
              </div>
            )}

            {!loading && flightResults && !noFlights && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-extrabold tracking-tight">{flights.length} flight{flights.length === 1 ? '' : 's'}</h2>
                    <p className="text-muted-foreground flex items-center gap-2">{flightResults.origin} <ArrowRight className="w-4 h-4" /> {flightResults.destination}
                      {flights[0] && <span>· from <b className="text-foreground">{formatAmount(flights[0].price, flights[0].currency)}</b></span>}
                    </p>
                  </div>
                  <Segmented label="Sort flights" value={sort} onChange={setSort} options={[{ value: 'price', label: 'Cheapest' }, { value: 'stops', label: 'Fewest stops' }]} />
                </div>
                {flights.map((fl, i) => <FlightCard key={fl.id || i} flight={fl} best={i === 0 && sort === 'price'} />)}
              </div>
            )}

            {!loading && results && !noOthers && (
              <div className="space-y-4">
                <div className="flex items-end justify-between gap-3">
                  <h2 className="text-2xl font-extrabold tracking-tight">{otherResults.length} result{otherResults.length === 1 ? '' : 's'}</h2>
                  <span className="text-sm text-muted-foreground inline-flex items-center gap-1.5"><TrendingDown className="w-4 h-4 text-primary" /> Lowest price first</span>
                </div>
                {otherResults.map((r, i) => <ResultCard key={r.id || i} result={r} tab={searchedTab} />)}
              </div>
            )}

            {!loading && (noFlights || noOthers) && (
              <div className="text-center rounded-3xl border border-border bg-card py-16 px-6">
                <SearchX className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-1">No results found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">{directOnly && noFlights ? 'No direct flights match. Try turning off “Direct flights only”.' : 'Try different dates or a nearby destination.'}</p>
              </div>
            )}

            {!loading && !hasResults && !error && (
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { icon: ArrowRightLeft, title: 'Compare in one place', text: 'See options from several providers with a clear price for each.' },
                  { icon: TrendingDown, title: 'Lowest price first', text: 'Results are sorted so the best value is always at the top.' },
                  { icon: ShieldCheck, title: 'Book with the provider', text: 'Choose a deal and finish securely on the provider’s own site.' },
                ].map((c) => (
                  <div key={c.title} className="rounded-3xl border border-border bg-card p-6">
                    <span className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4"><c.icon className="w-5 h-5" /></span>
                    <h3 className="font-bold mb-1">{c.title}</h3>
                    <p className="text-sm text-muted-foreground">{c.text}</p>
                  </div>
                ))}
              </div>
            )}

            {hasResults && !loading && (
              <p className="mt-6 text-xs text-muted-foreground text-center">Prices come from third-party providers and can change. You complete your booking on the provider’s site.</p>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingPage;
