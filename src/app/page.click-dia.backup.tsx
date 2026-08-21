"use client";

import { FormEvent, useEffect, useState } from "react";

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

const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

function getMonthName(date: Date) {
  return date.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
}

function getCalendarDays(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let startingDay = firstDay.getDay();

  // Convertimos domingo=0 a domingo=6,
  // para que la semana empiece en lunes.
  if (startingDay === 0) {
    startingDay = 7;
  }

  const days: Array<number | null> = [];

  for (let index = 1; index < startingDay; index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(day);
  }

  return days;
}
function createDateKey(year: number, month: number, day: number) {
  const monthText = String(month + 1).padStart(2, "0");
  const dayText = String(day).padStart(2, "0");

  return `${year}-${monthText}-${dayText}`;
}
function getStatusClass(status: EventStatus) {
  if (status === "Planificado") {
    return "bg-slate-100 text-slate-700";
  }

  if (status === "En curso") {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-emerald-100 text-emerald-800";
}

export default function Home() {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [loaded, setLoaded] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Operaciones");

  const [currentMonth, setCurrentMonth] = useState(
    new Date(2026, 7, 1),
  );

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
    setCategory("Operaciones");
  }

  function deleteEvent(id: number) {
    setEvents((currentEvents) =>
      currentEvents.filter((event) => event.id !== id),
    );
  }

  function goToPreviousMonth() {
    setCurrentMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  }

  function goToNextMonth() {
    setCurrentMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  }

  function goToToday() {
    setCurrentMonth(new Date(2026, 7, 1));
  }

  const calendarDays = getCalendarDays(currentMonth);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const plannedCount = events.filter(
    (event) => event.status === "Planificado",
  ).length;

  const inProgressCount = events.filter(
    (event) => event.status === "En curso",
  ).length;

  const completedCount = events.filter(
    (event) => event.status === "Completado",
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Retail
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              Calendar
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Calendario central de operaciones para todas las tiendas
            </p>
          </div>

          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium">
            HQ Operations
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-xl font-semibold">Calendario operativo</h2>

            <p className="mt-1 text-sm text-slate-500">
              Gestiona las acciones de todas las tiendas desde un único
              calendario.
            </p>
          </div>

          <div className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Todas las tiendas
          </div>
        </div>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Planificadas</p>
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

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Nueva acción</h2>

            <p className="mt-1 text-sm text-slate-500">
              Añade una actividad al calendario.
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
                  onChange={(event) => setDate(event.target.value)}
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
            <div className="flex items-center justify-between border-b px-5 py-4 md:px-6">
              <div>
                <h2 className="font-semibold capitalize">
                  {getMonthName(currentMonth)}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Vista mensual · HQ
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
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
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
                  aria-label="Mes siguiente"
                >
                  →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b bg-slate-50">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="border-r px-2 py-3 text-center text-xs font-semibold text-slate-500 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-28 border-b border-r bg-slate-50/50 p-2"
                    />
                  );
                }

                const dateKey = createDateKey(year, month, day);

                const dayEvents = events.filter(
                  (event) => event.date === dateKey,
                );

                const isToday =
                  year === 2026 && month === 7 && day === 20;

                return (
                  <div
                    key={dateKey}
                    className="min-h-28 border-b border-r p-2 align-top"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                          isToday
                            ? "bg-slate-900 text-white"
                            : "text-slate-700"
                        }`}
                      >
                        {day}
                      </span>

                      {dayEvents.length > 0 && (
                        <span className="text-[10px] text-slate-400">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="rounded-md border border-slate-200 bg-slate-50 p-2"
                        >
                          <p className="truncate text-xs font-semibold">
                            {event.title}
                          </p>

                          <div className="mt-1 flex items-center justify-between gap-1">
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${getStatusClass(
                                event.status,
                              )}`}
                            >
                              {event.status}
                            </span>
                          </div>

                          <p className="mt-1 truncate text-[10px] text-slate-400">
                            {event.category}
                          </p>

                          <button
                            type="button"
                            onClick={() => deleteEvent(event.id)}
                            className="mt-1 text-[10px] font-medium text-slate-500 hover:text-slate-900"
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t px-5 py-4 md:px-6">
              <p className="text-xs text-slate-400">
                {events.length} acciones en el calendario · Todas las tiendas
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}