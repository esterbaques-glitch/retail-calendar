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

export default function Home() {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [loaded, setLoaded] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Operaciones");

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

  const sortedEvents = [...events].sort((a, b) =>
    a.date.localeCompare(b.date),
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

          <section className="rounded-xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold">
                  Calendario operativo
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Próximas acciones de retail
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
                {events.length} acciones
              </span>
            </div>

            <div className="divide-y">
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