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

  const days = [];

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

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
    [events],
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
    return events.filter((event) => event.date === dateKey);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Retail Calendar
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Calendario central de operaciones para todas las tiendas
            </p>
          </div>

          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium">
            Agosto 2026
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Acciones planificadas</p>

            <p className="mt-2 text-3xl font-bold">{plannedCount}</p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">En curso</p>

            <p className="mt-2 text-3xl font-bold">{inProgressCount}</p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Completadas</p>

            <p className="mt-2 text-3xl font-bold">{completedCount}</p>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <section
            id="new-event-form"
            className="rounded-xl border bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold">Nueva acción</h2>

            <p className="mt-1 text-sm text-slate-500">
              Haz clic en un día del calendario para seleccionar la fecha.
            </p>

            <form onSubmit={addEvent} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="mb-1 block text-sm font-medium"
                >
                  Acción
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ej. Cambio de escaparate"
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="mb-1 block text-sm font-medium"
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
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="mb-1 block text-sm font-medium"
                >
                  Categoría
                </label>

                <select
                  id="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option>Operaciones</option>
                  <option>Campaña</option>
                  <option>Visual</option>
                  <option>Stock</option>
                  <option>Personal</option>
                  <option>Formación</option>
                </select>
              </div>

              <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
                Ámbito:{" "}
                <span className="font-medium text-slate-700">
                  Todas las tiendas
                </span>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Añadir al calendario
              </button>
            </form>
          </section>

          <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Calendario operativo
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Próximas acciones de retail
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50"
                  aria-label="Mes anterior"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={goToToday}
                  className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50"
                >
                  Hoy
                </button>

                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50"
                  aria-label="Mes siguiente"
                >
                  →
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="mb-4 text-center">
                <h3 className="text-xl font-bold capitalize">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h3>
              </div>

              <div className="grid grid-cols-7 border-l border-t">
                {WEEKDAY_NAMES.map((weekday) => (
                  <div
                    key={weekday}
                    className="border-b border-r bg-slate-50 px-2 py-2 text-center text-xs font-semibold text-slate-500"
                  >
                    {weekday}
                  </div>
                ))}

                {monthDays.map((day, index) => {
                  if (day === null) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="min-h-28 border-b border-r bg-slate-50"
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
                      className={`min-h-28 border-b border-r p-2 text-left align-top transition hover:bg-slate-50 ${
                        isSelected ? "bg-slate-100 ring-2 ring-inset ring-slate-400" : ""
                      }`}
                    >
                      <div className="mb-2 text-sm font-semibold">
                        {day}
                      </div>

                      <div className="space-y-1">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white"
                          >
                            <div className="font-medium">{event.title}</div>
                            <div className="mt-0.5 opacity-75">
                              {event.category}
                            </div>
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Todas las acciones</h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {events.length} acciones guardadas
                  </p>
                </div>
              </div>

              <div className="divide-y rounded-lg border">
                {sortedEvents.length === 0 ? (
                  <div className="px-6 py-12 text-center text-slate-500">
                    No hay acciones en el calendario.
                  </div>
                ) : (
                  sortedEvents.map((event) => (
                    <article
                      key={event.id}
                      className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex gap-4">
                        <div className="min-w-24">
                          <p className="text-sm font-semibold">
                            {new Date(
                              `${event.date}T00:00:00`,
                            ).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {new Date(
                              `${event.date}T00:00:00`,
                            ).toLocaleDateString("es-ES", {
                              weekday: "long",
                            })}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-semibold">{event.title}</h3>

                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1">
                              Todas las tiendas
                            </span>

                            <span className="rounded-full bg-slate-100 px-2.5 py-1">
                              {event.category}
                            </span>

                            <StatusBadge status={event.status} />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteEvent(event.id)}
                        className="rounded-lg border px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
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