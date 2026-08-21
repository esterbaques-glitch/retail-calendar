"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type EventStatus = "Planificado" | "En curso" | "Completado";

type CalendarEvent = {
  id: number;
  title: string;
  date: string;
  category: string;
  status: EventStatus;
};

const initialEvents: CalendarEvent[] = [
  {
    id: 1,
    title: "Campaña vuelta al cole",
    date: "2026-08-24",
    category: "Campaña",
    status: "Planificado",
  },
  {
    id: 2,
    title: "Cambio de escaparate",
    date: "2026-08-26",
    category: "Visual",
    status: "Planificado",
  },
  {
    id: 3,
    title: "Revisión de stock",
    date: "2026-08-28",
    category: "Operaciones",
    status: "En curso",
  },
];

const STORAGE_KEY = "retail-calendar-events";

const CATEGORIES = [
  "Operaciones",
  "Campaña",
  "Visual",
  "Stock",
  "Personal",
  "Formación",
];

const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const WEEKDAY_NAMES = ["L", "M", "X", "J", "V", "S", "D"];

function createDateKey(year: number, month: number, day: number) {
  const monthText = String(month + 1).padStart(2, "0");
  const dayText = String(day).padStart(2, "0");

  return `${year}-${monthText}-${dayText}`;
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const mondayFirstDay = (firstDay.getDay() + 6) % 7;

  const days: Array<number | null> = [];

  for (let i = 0; i < mondayFirstDay; i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(day);
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

function getCategoryClass(category: string) {
  switch (category) {
    case "Campaña":
      return "bg-blue-50 text-blue-700 border-blue-100";

    case "Visual":
      return "bg-purple-50 text-purple-700 border-purple-100";

    case "Stock":
      return "bg-orange-50 text-orange-700 border-orange-100";

    case "Personal":
      return "bg-pink-50 text-pink-700 border-pink-100";

    case "Formación":
      return "bg-green-50 text-green-700 border-green-100";

    default:
      return "bg-slate-50 text-slate-700 border-slate-100";
  }
}

export default function Home() {
  const today = new Date();

  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [loaded, setLoaded] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Operaciones");
  const [selectedDate, setSelectedDate] = useState("");

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(7);

  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    try {
      const savedEvents = window.localStorage.getItem(STORAGE_KEY);

      if (savedEvents) {
        const parsedEvents: CalendarEvent[] = JSON.parse(savedEvents);
        setEvents(parsedEvents);
      }
    } catch (error) {
      console.error("No se pudieron cargar las acciones:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error("No se pudieron guardar las acciones:", error);
    }
  }, [events, loaded]);

  const monthDays = useMemo(
    () => getMonthDays(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return events.filter((event) => {
      const matchesCategory =
        categoryFilter === "Todas" || event.category === categoryFilter;

      const matchesSearch =
        normalizedSearch === "" ||
        event.title.toLowerCase().includes(normalizedSearch) ||
        event.category.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [events, categoryFilter, searchTerm]);

  const sortedEvents = useMemo(
    () => [...filteredEvents].sort((a, b) => a.date.localeCompare(b.date)),
    [filteredEvents],
  );

  const plannedCount = events.filter(
    (event) => event.status === "Planificado",
  ).length;

  const inProgressCount = events.filter(
    (event) => event.status === "En curso",
  ).length;

  const completedCount = events.filter(
    (event) => event.status === "Completado",
  ).length;

  function addEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !date) {
      return;
    }

    const newEvent: CalendarEvent = {
      id: Date.now(),
      title: title.trim(),
      date,
      category,
      status: "Planificado",
    };

    setEvents((currentEvents) => [...currentEvents, newEvent]);

    setTitle("");
    setDate("");
    setSelectedDate("");
    setCategory("Operaciones");
  }

  function deleteEvent(id: number) {
    setEvents((currentEvents) =>
      currentEvents.filter((event) => event.id !== id),
    );
  }

  function goToPreviousMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((year) => year - 1);
    } else {
      setCurrentMonth((month) => month - 1);
    }
  }

  function goToNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((year) => year + 1);
    } else {
      setCurrentMonth((month) => month + 1);
    }
  }

  function goToToday() {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  }

  function selectDay(dateKey: string) {
    setDate(dateKey);
    setSelectedDate(dateKey);

    document
      .getElementById("new-event-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function getEventsForDate(dateKey: string) {
    return filteredEvents.filter((event) => event.date === dateKey);
  }

  function clearSearch() {
    setSearchTerm("");
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
                R
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Retail Calendar
                </h1>

                <p className="text-sm text-slate-500">
                  Gestión central de operaciones
                </p>
              </div>
            </div>
          </div>

          <div className="hidden rounded-xl border bg-slate-50 px-4 py-2 text-right sm:block">
            <p className="text-xs text-slate-500">Vista actual</p>

            <p className="text-sm font-semibold">Calendario central</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Planificadas
              </p>

              <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                Total
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold">{plannedCount}</p>

            <p className="mt-1 text-xs text-slate-400">
              Acciones pendientes
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">En curso</p>

              <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                Activas
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold">{inProgressCount}</p>

            <p className="mt-1 text-xs text-slate-400">
              Acciones actualmente activas
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Completadas
              </p>

              <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                Finalizadas
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold">{completedCount}</p>

            <p className="mt-1 text-xs text-slate-400">
              Acciones terminadas
            </p>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          <section
            id="new-event-form"
            className="rounded-2xl border bg-white p-6 shadow-sm"
          >
            <div className="mb-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
                +
              </div>

              <h2 className="text-lg font-semibold">Nueva acción</h2>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                Haz clic en un día del calendario para seleccionar
                automáticamente la fecha.
              </p>
            </div>

            <form onSubmit={addEvent} className="space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Acción
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ej. Cambio de escaparate"
                  className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Fecha
                </label>

                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(event) => {
                    setDate(event.target.value);
                    setSelectedDate(event.target.value);
                  }}
                  className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Categoría
                </label>

                <select
                  id="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                >
                  {CATEGORIES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500">
                  Ámbito de la acción
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  Todas las tiendas
                </p>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 active:scale-[0.99]"
              >
                Añadir al calendario
              </button>
            </form>
          </section>

          <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="border-b px-6 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Calendario operativo
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Vista mensual de las acciones planificadas
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goToPreviousMonth}
                    className="rounded-xl border px-3 py-2 text-sm font-medium transition hover:bg-slate-50"
                    aria-label="Mes anterior"
                  >
                    ←
                  </button>

                  <button
                    type="button"
                    onClick={goToToday}
                    className="rounded-xl border px-3 py-2 text-sm font-medium transition hover:bg-slate-50"
                  >
                    Hoy
                  </button>

                  <button
                    type="button"
                    onClick={goToNextMonth}
                    className="rounded-xl border px-3 py-2 text-sm font-medium transition hover:bg-slate-50"
                    aria-label="Mes siguiente"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Mes
                </p>

                <h3 className="mt-1 text-2xl font-bold capitalize">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h3>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">
                <div>
                  <label
                    htmlFor="search"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Buscar acción
                  </label>

                  <div className="relative">
                    <input
                      id="search"
                      type="search"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Ej. escaparate, stock, campaña..."
                      className="w-full rounded-xl border bg-white px-3 py-2.5 pr-20 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />

                    {searchTerm && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>

                  <p className="mt-1.5 text-xs text-slate-400">
                    Busca por nombre de acción o categoría.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div>
                    <label
                      htmlFor="category-filter"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Categoría
                    </label>

                    <select
                      id="category-filter"
                      value={categoryFilter}
                      onChange={(event) =>
                        setCategoryFilter(event.target.value)
                      }
                      className="rounded-xl border bg-white px-3 py-2.5 text-sm font-medium outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="Todas">Todas</option>

                      {CATEGORIES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="rounded-xl bg-slate-100 px-3 py-2.5 text-center text-xs font-semibold text-slate-600">
                    {filteredEvents.length} acciones
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-7 overflow-hidden rounded-xl border">
                {WEEKDAY_NAMES.map((weekday) => (
                  <div
                    key={weekday}
                    className="border-b bg-slate-50 px-2 py-2.5 text-center text-xs font-bold text-slate-500"
                  >
                    {weekday}
                  </div>
                ))}

                {monthDays.map((day, index) => {
                  if (day === null) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="min-h-24 border-b border-r bg-slate-50 sm:min-h-28"
                      />
                    );
                  }

                  const dateKey = createDateKey(
                    currentYear,
                    currentMonth,
                    day,
                  );

                  const dayEvents = getEventsForDate(dateKey);
                  const isSelected = selectedDate === dateKey;

                  return (
                    <button
                      type="button"
                      key={dateKey}
                      onClick={() => selectDay(dateKey)}
                      className={`min-h-24 border-b border-r p-2 text-left align-top transition sm:min-h-28 ${
                        isSelected
                          ? "bg-slate-100 ring-2 ring-inset ring-slate-400"
                          : "bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                            isSelected
                              ? "bg-slate-900 text-white"
                              : "text-slate-700"
                          }`}
                        >
                          {day}
                        </span>

                        {dayEvents.length > 0 && (
                          <span className="text-[10px] font-medium text-slate-400">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className={`rounded-lg border px-2 py-1.5 ${getCategoryClass(
                              event.category,
                            )}`}
                          >
                            <div className="truncate text-[11px] font-semibold">
                              {event.title}
                            </div>

                            <div className="mt-0.5 truncate text-[10px] opacity-70">
                              {event.category}
                            </div>
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 text-xs text-slate-400">
                La búsqueda y el filtro afectan únicamente a la vista. Las
                acciones siguen guardadas en el calendario.
              </p>
            </div>

            <div className="border-t bg-slate-50/50 px-6 py-5">
              <div className="mb-4">
                <h3 className="font-semibold">Listado de acciones</h3>

                <p className="mt-1 text-sm text-slate-500">
                  {searchTerm
                    ? `Resultados para "${searchTerm}"`
                    : categoryFilter === "Todas"
                      ? "Todas las acciones registradas"
                      : `Acciones de la categoría: ${categoryFilter}`}
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border bg-white">
                {sortedEvents.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-sm font-medium text-slate-600">
                      No hay acciones que coincidan.
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Prueba con otra búsqueda o categoría.
                    </p>
                  </div>
                ) : (
                  sortedEvents.map((event) => (
                    <article
                      key={event.id}
                      className="flex flex-col gap-4 border-b px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 gap-4">
                        <div className="min-w-20">
                          <p className="text-sm font-bold">
                            {new Date(
                              `${event.date}T00:00:00`,
                            ).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </p>

                          <p className="mt-1 text-xs capitalize text-slate-400">
                            {new Date(
                              `${event.date}T00:00:00`,
                            ).toLocaleDateString("es-ES", {
                              weekday: "long",
                            })}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold">
                            {event.title}
                          </h3>

                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                              Todas las tiendas
                            </span>

                            <span
                              className={`rounded-full border px-2.5 py-1 ${getCategoryClass(
                                event.category,
                              )}`}
                            >
                              {event.category}
                            </span>

                            <StatusBadge status={event.status} />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteEvent(event.id)}
                        className="rounded-xl border px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                      >
                        Eliminar
                      </button>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: EventStatus }) {
  let className = "";

  if (status === "Planificado") {
    className = "bg-slate-100 text-slate-700";
  } else if (status === "En curso") {
    className = "bg-amber-100 text-amber-800";
  } else {
    className = "bg-emerald-100 text-emerald-800";
  }

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {status}
    </span>
  );
}