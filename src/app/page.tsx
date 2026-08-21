"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type EventStatus = "Planificado" | "En curso" | "Completado";

type EventDocument = {
  name: string;
  pathname: string;
  url: string;
};

type CalendarEvent = {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  category: string;
  status: EventStatus;
  documents: EventDocument[];
};

const initialEvents: CalendarEvent[] = [
  {
    id: 1,
    title: "Campaña vuelta al cole",
    startDate: "2026-08-24",
    endDate: "2026-08-28",
    category: "Campaña",
    status: "Planificado",
    documents: [],
  },
  {
    id: 2,
    title: "Cambio de escaparate",
    startDate: "2026-08-26",
    endDate: "2026-08-26",
    category: "Visual",
    status: "Planificado",
    documents: [],
  },
  {
    id: 3,
    title: "Revisión de stock",
    startDate: "2026-08-28",
    endDate: "2026-08-28",
    category: "Operaciones",
    status: "En curso",
    documents: [],
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

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

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

function eventIncludesDate(event: CalendarEvent, dateKey: string) {
  return event.startDate <= dateKey && dateKey <= event.endDate;
}

function formatDate(dateKey: string) {
  if (!dateKey) {
    return "";
  }

  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("Operaciones");

  const [selectedDate, setSelectedDate] = useState("");

  // NUEVO: acción cuyo detalle está abierto
  const [selectedEvent, setSelectedEvent] =
    useState<CalendarEvent | null>(null);

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(7);

  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    try {
      const savedEvents = window.localStorage.getItem(STORAGE_KEY);

      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents);

        const normalizedEvents: CalendarEvent[] = parsedEvents.map(
          (
            event: CalendarEvent & {
              date?: string;
              documents?: EventDocument[];
            },
          ) => ({
            id: event.id,
            title: event.title,
            startDate: event.startDate ?? event.date ?? "",
            endDate:
              event.endDate ??
              event.startDate ??
              event.date ??
              "",
            category: event.category,
            status: event.status,
            documents: Array.isArray(event.documents)
              ? event.documents
              : [],
          }),
        );

        setEvents(normalizedEvents);
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
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(events),
      );
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
        categoryFilter === "Todas" ||
        event.category === categoryFilter;

      const matchesSearch =
        normalizedSearch === "" ||
        event.title.toLowerCase().includes(normalizedSearch) ||
        event.category.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [events, categoryFilter, searchTerm]);

  const sortedEvents = useMemo(
    () =>
      [...filteredEvents].sort((a, b) =>
        a.startDate.localeCompare(b.startDate),
      ),
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

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);

    setUploadError("");

    const invalidFile = files.find(
      (file) =>
        file.size > MAX_FILE_SIZE ||
        !ALLOWED_FILE_TYPES.includes(file.type),
    );

    if (invalidFile) {
      setSelectedFiles([]);
      setUploadError(
        "Solo se permiten JPG, PNG, WEBP y PDF de hasta 10 MB.",
      );
      event.target.value = "";
      return;
    }

    setSelectedFiles(files);
  }

  async function uploadDocument(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "No se ha podido subir el documento.",
      );
    }

    return {
      name: file.name,
      pathname: data.pathname,
      url: data.url,
    } as EventDocument;
  }

  async function addEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setUploadError("");

    if (!title.trim() || !startDate) {
      return;
    }

    const finalEndDate = endDate || startDate;

    if (finalEndDate < startDate) {
      setUploadError(
        "La fecha fin no puede ser anterior a la fecha inicio.",
      );
      return;
    }

    try {
      setUploading(true);

      const documents: EventDocument[] = [];

      for (const file of selectedFiles) {
        const document = await uploadDocument(file);
        documents.push(document);
      }

      const newEvent: CalendarEvent = {
        id: Date.now(),
        title: title.trim(),
        startDate,
        endDate: finalEndDate,
        category,
        status: "Planificado",
        documents,
      };

      setEvents((currentEvents) => [
        ...currentEvents,
        newEvent,
      ]);

      setTitle("");
      setStartDate("");
      setEndDate("");
      setCategory("Operaciones");
      setSelectedFiles([]);
      setSelectedDate("");

      const fileInput = document.getElementById(
        "documents",
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error(
        "No se pudieron subir los documentos:",
        error,
      );

      setUploadError(
        error instanceof Error
          ? error.message
          : "No se pudieron subir los documentos.",
      );
    } finally {
      setUploading(false);
    }
  }

  function deleteEvent(id: number) {
    setEvents((currentEvents) =>
      currentEvents.filter((event) => event.id !== id),
    );

    setSelectedEvent(null);
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
    setStartDate(dateKey);
    setEndDate("");
    setSelectedDate(dateKey);

    document
      .getElementById("new-event-form")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function getEventsForDate(dateKey: string) {
    return filteredEvents.filter((event) =>
      eventIncludesDate(event, dateKey),
    );
  }

  function clearSearch() {
    setSearchTerm("");
  }

  function openEvent(event: CalendarEvent) {
    setSelectedEvent(event);
  }

  function closeEvent() {
    setSelectedEvent(null);
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
            <p className="text-xs text-slate-500">
              Vista actual
            </p>

            <p className="text-sm font-semibold">
              Calendario central
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Planificadas
            </p>

            <p className="mt-3 text-3xl font-bold">
              {plannedCount}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Acciones pendientes
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              En curso
            </p>

            <p className="mt-3 text-3xl font-bold">
              {inProgressCount}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Acciones actualmente activas
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Completadas
            </p>

            <p className="mt-3 text-3xl font-bold">
              {completedCount}
            </p>

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

              <h2 className="text-lg font-semibold">
                Nueva acción
              </h2>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                Añade una acción al calendario central.
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
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Ej. Montaje campaña vuelta al cole"
                  className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <label
                    htmlFor="start-date"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Fecha inicio
                  </label>

                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(event) => {
                      setStartDate(event.target.value);

                      if (
                        endDate &&
                        event.target.value > endDate
                      ) {
                        setEndDate("");
                      }

                      setSelectedDate(event.target.value);
                    }}
                    className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="end-date"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Fecha fin
                    <span className="ml-1 font-normal text-slate-400">
                      (opcional)
                    </span>
                  </label>

                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(event) =>
                      setEndDate(event.target.value)
                    }
                    className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Déjala vacía si la acción es de un solo día.
                  </p>
                </div>
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
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                >
                  {CATEGORIES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
                    📎
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Documentación
                    </p>

                    <p className="text-xs text-slate-500">
                      Fotos, PDFs y material de apoyo
                    </p>
                  </div>
                </div>

                <label
                  htmlFor="documents"
                  className="mt-4 flex cursor-pointer items-center justify-center rounded-xl border border-dashed bg-white px-4 py-4 text-center transition hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Seleccionar documentos
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      JPG, PNG, WEBP o PDF · máximo 10 MB por
                      archivo
                    </p>
                  </div>
                </label>

                <input
                  id="documents"
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />

                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedFiles.map((file) => (
                      <div
                        key={`${file.name}-${file.size}`}
                        className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2"
                      >
                        <span className="text-sm">📎</span>

                        <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">
                          {file.name}
                        </span>

                        <span className="text-[10px] text-slate-400">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {uploadError && (
                  <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {uploadError}
                  </div>
                )}
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
                disabled={
                  uploading ||
                  !title.trim() ||
                  !startDate
                }
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {uploading
                  ? "Subiendo documentos..."
                  : "Añadir al calendario"}
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
                      onChange={(event) =>
                        setSearchTerm(event.target.value)
                      }
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
                    <div
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
                          <button
                            key={event.id}
                            type="button"
                            onClick={(clickEvent) => {
                              clickEvent.stopPropagation();
                              openEvent(event);
                            }}
                            className={`block w-full rounded-lg border px-2 py-1.5 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${getCategoryClass(
                              event.category,
                            )}`}
                          >
                            <div className="truncate text-[11px] font-semibold">
                              {event.title}
                            </div>

                            {event.startDate !== event.endDate && (
                              <div className="mt-0.5 text-[9px] font-medium opacity-70">
                                {event.startDate === dateKey
                                  ? "Inicio"
                                  : event.endDate === dateKey
                                    ? "Fin"
                                    : "En curso"}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 text-xs text-slate-400">
                Haz clic directamente sobre una acción para ver su
                detalle.
              </p>
            </div>

            <div className="border-t bg-slate-50/50 px-6 py-5">
              <div className="mb-4">
                <h3 className="font-semibold">
                  Listado de acciones
                </h3>

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
                      onClick={() => openEvent(event)}
                      className="cursor-pointer border-b px-5 py-4 transition hover:bg-slate-50 last:border-b-0"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 gap-4">
                          <div className="min-w-24">
                            <p className="text-sm font-bold">
                              {formatDate(event.startDate)}
                            </p>

                            {event.startDate !== event.endDate && (
                              <p className="mt-1 text-xs text-slate-400">
                                hasta {formatDate(event.endDate)}
                              </p>
                            )}
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

                              {event.documents.length > 0 && (
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                                  📎 {event.documents.length}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="rounded-xl border px-3 py-2 text-sm font-medium text-slate-600">
                            Ver detalle →
                          </span>

                          <button
                            type="button"
                            onClick={(clickEvent) => {
                              clickEvent.stopPropagation();
                              deleteEvent(event.id);
                            }}
                            className="rounded-xl border px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* =====================================================
          DETALLE DE LA ACCIÓN
          ===================================================== */}

      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEvent();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-detail-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b px-6 py-5">
              <div className="min-w-0 pr-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Detalle de la acción
                </p>

                <h2
                  id="event-detail-title"
                  className="mt-1 text-xl font-bold text-slate-900"
                >
                  {selectedEvent.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeEvent}
                aria-label="Cerrar detalle"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-lg text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              >
                ×
              </button>
            </div>

            <div className="max-h-[calc(90vh-150px)] overflow-y-auto px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  label="Fecha inicio"
                  value={formatDate(selectedEvent.startDate)}
                />

                <DetailItem
                  label="Fecha fin"
                  value={formatDate(selectedEvent.endDate)}
                />

                <DetailItem
                  label="Categoría"
                  value={selectedEvent.category}
                  valueClassName={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getCategoryClass(
                    selectedEvent.category,
                  )}`}
                />

                <div className="rounded-xl border bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Estado
                  </p>

                  <div className="mt-2">
                    <StatusBadge status={selectedEvent.status} />
                  </div>
                </div>

                <DetailItem
                  label="Ámbito"
                  value="Todas las tiendas"
                  className="sm:col-span-2"
                />
              </div>

              <div className="mt-6 rounded-xl border">
                <div className="border-b bg-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        Documentos adjuntos
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Fotos, PDFs y material de apoyo asociados a
                        esta acción.
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">
                      {selectedEvent.documents.length}
                    </span>
                  </div>
                </div>

                {selectedEvent.documents.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-lg">
                      📎
                    </div>

                    <p className="mt-3 text-sm font-medium text-slate-600">
                      No hay documentos adjuntos
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Esta acción no tiene archivos asociados.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {selectedEvent.documents.map((file) => (
                      <a
                        key={file.pathname}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 px-4 py-4 transition hover:bg-slate-50"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
                          {file.name
                            .toLowerCase()
                            .endsWith(".pdf")
                            ? "📄"
                            : "🖼️"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {file.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {file.name
                              .toLowerCase()
                              .endsWith(".pdf")
                              ? "Documento PDF"
                              : "Imagen"}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-600">
                          Abrir →
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={closeEvent}
                className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function DetailItem({
  label,
  value,
  className = "",
  valueClassName = "",
}: {
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={`rounded-xl border bg-slate-50 p-4 ${className}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-sm font-semibold text-slate-800 ${valueClassName}`}
      >
        {value}
      </p>
    </div>
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