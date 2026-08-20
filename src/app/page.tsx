"use client";

import { useEffect, useMemo, useState } from "react";

type Task = {
  id: number;
  title: string;
  category: string;
  date: string;
  stores: number;
  status: "Pendiente" | "En progreso" | "Completada";
};

const initialTasks: Task[] = [];

const stores = [
  "Todas las tiendas",
  "Madrid Centro",
  "Barcelona Diagonal",
  "Valencia Centro",
  "Sevilla Nervión",
];

const categories = [
  "Todas las categorías",
  "Visual Merchandising",
  "Marketing",
  "Operaciones",
  "Formación",
];

const weekdays = ["L", "M", "X", "J", "V", "S", "D"];

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;
}

function normalizeDate(date: string | null | undefined) {
  if (!date) return "";
  return String(date).slice(0, 10);
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("Calendario");

  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const [selectedStore, setSelectedStore] =
    useState("Todas las tiendas");

  const [selectedCategory, setSelectedCategory] =
    useState("Todas las categorías");

  const [showModal, setShowModal] = useState(false);

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDate, setNewDate] = useState("2026-08-20");
  const [newCategory, setNewCategory] = useState("Operaciones");
  const [newStores, setNewStores] = useState<string[]>([]);

  /*
   * CARGAR TAREAS DESDE LA API
   */
  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch("/api/tasks");

        if (!response.ok) {
          throw new Error("No se pudieron cargar las tareas");
        }

        const data = await response.json();

        const loadedTasks: Task[] = data.map((task: any) => ({
          id: task.id,
          title: task.title,
          category: task.category,
          date: normalizeDate(task.due_date),
          stores: task.stores ?? 1,
          status: task.status ?? "Pendiente",
        }));

        setTasks(loadedTasks);
      } catch (error) {
        console.error("Error cargando tareas:", error);
      }
    }

    loadTasks();
  }, []);

  /*
   * FILTROS
   */
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const categoryMatches =
        selectedCategory === "Todas las categorías" ||
        task.category === selectedCategory;

      /*
       * De momento la API devuelve el número de tiendas,
       * no las tiendas concretas.
       *
       * Por eso el filtro de tienda no puede distinguir todavía
       * Madrid, Barcelona, Valencia o Sevilla.
       */
      const storeMatches =
        selectedStore === "Todas las tiendas" || task.stores > 0;

      return categoryMatches && storeMatches;
    });
  }, [tasks, selectedCategory, selectedStore]);

  /*
   * CALENDARIO AGOSTO 2026
   */
  const daysInMonth = 31;

  // Agosto de 2026 empieza en sábado.
  const firstDayOffset = 5;

  const calendarCells = Array.from(
    { length: firstDayOffset + daysInMonth },
    (_, index) => {
      const day = index - firstDayOffset + 1;

      return day > 0 && day <= daysInMonth ? day : null;
    },
  );

  /*
   * CREAR TAREA
   */
  async function createTask() {
    if (!newTitle.trim()) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          dueDate: newDate,
          category: newCategory,

          /*
           * De momento guardamos el número de tiendas.
           * Si no selecciona ninguna, usamos 1.
           */
          stores: newStores.length || 1,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo crear la tarea");
      }

      const createdTask = await response.json();

      const task: Task = {
        id: createdTask.id,
        title: createdTask.title,
        category: createdTask.category,
        date: normalizeDate(createdTask.due_date),
        stores: createdTask.stores ?? newStores.length ?? 1,
        status: createdTask.status ?? "Pendiente",
      };

      setTasks((current) => [...current, task]);

      setShowModal(false);

      setNewTitle("");
      setNewDescription("");
      setNewDate("2026-08-20");
      setNewCategory("Operaciones");
      setNewStores([]);
    } catch (error) {
      console.error(error);
      alert("No se pudo crear la tarea");
    }
  }

  /*
   * SELECCIONAR / DESELECCIONAR TIENDA
   */
  function toggleStore(store: string) {
    setNewStores((current) =>
      current.includes(store)
        ? current.filter((item) => item !== store)
        : [...current, store],
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-zinc-900">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-64 flex-col border-r border-zinc-200 bg-white px-5 py-6 md:flex">
          <div className="mb-10">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Retail
            </div>

            <div className="mt-1 text-xl font-semibold tracking-tight">
              Calendar
            </div>
          </div>

          <nav className="space-y-1">
            {[
              ["📅", "Calendario"],
              ["✓", "Tareas"],
              ["⌂", "Tiendas"],
            ].map(([icon, label]) => (
              <button
                key={label}
                onClick={() => setActiveSection(label)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  activeSection === label
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                <span className="w-5 text-center">
                  {icon}
                </span>

                {label}
              </button>
            ))}
          </nav>

          <div className="mt-auto border-t border-zinc-100 pt-5">
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-500 hover:bg-zinc-100">
              <span>⚙</span>
              Configuración
            </button>

            <div className="mt-5 rounded-2xl bg-zinc-50 p-4">
              <div className="text-xs font-medium text-zinc-400">
                HQ OPERATIONS
              </div>

              <div className="mt-1 text-sm font-semibold">
                Retail HQ
              </div>

              <div className="mt-1 text-xs text-zinc-500">
                Gestión central
              </div>
            </div>
          </div>
        </aside>

        {/* MOBILE HEADER */}
        <div className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 md:hidden">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Retail
            </div>

            <div className="font-semibold">
              Calendar
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
          >
            + Tarea
          </button>
        </div>

        {/* MAIN */}
        <section className="min-w-0 flex-1 px-4 pb-8 pt-20 md:px-8 md:pt-8">
          <div className="mx-auto max-w-[1500px]">
            {/* HEADER */}
            <header className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm font-medium text-zinc-400">
                  HQ Operations
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                  {activeSection}
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                  Gestiona las tareas de todas las tiendas desde un único
                  calendario.
                </p>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="hidden rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-700 md:block"
              >
                + Nueva tarea
              </button>
            </header>

            {/* CALENDARIO */}
            {activeSection === "Calendario" && (
              <>
                {/* STATS */}
                <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <Stat
                    label="Tareas este mes"
                    value={String(tasks.length)}
                    detail="Total"
                  />

                  <Stat
                    label="Pendientes"
                    value={String(
                      tasks.filter(
                        (task) => task.status === "Pendiente",
                      ).length,
                    )}
                    detail="Por completar"
                  />

                  <Stat
                    label="En progreso"
                    value={String(
                      tasks.filter(
                        (task) => task.status === "En progreso",
                      ).length,
                    )}
                    detail="En curso"
                  />

                  <Stat
                    label="Completadas"
                    value={String(
                      tasks.filter(
                        (task) => task.status === "Completada",
                      ).length,
                    )}
                    detail="Finalizadas"
                  />
                </div>

                {/* FILTERS */}
                <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm sm:flex-row">
                  <select
                    value={selectedStore}
                    onChange={(event) =>
                      setSelectedStore(event.target.value)
                    }
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-400"
                  >
                    {stores.map((store) => (
                      <option key={store}>
                        {store}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedCategory}
                    onChange={(event) =>
                      setSelectedCategory(event.target.value)
                    }
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-400"
                  >
                    {categories.map((category) => (
                      <option key={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <div className="hidden flex-1 sm:block" />

                  <div className="flex items-center gap-2 px-2 text-xs text-zinc-400">
                    Agosto 2026
                  </div>
                </div>

                {/* CALENDAR */}
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                    <div>
                      <h2 className="font-semibold">
                        Agosto 2026
                      </h2>

                      <p className="text-xs text-zinc-400">
                        Vista mensual · HQ
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50">
                        ←
                      </button>

                      <button className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50">
                        Hoy
                      </button>

                      <button className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50">
                        →
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50">
                    {weekdays.map((day) => (
                      <div
                        key={day}
                        className="border-r border-zinc-200 px-2 py-3 text-center text-xs font-semibold text-zinc-400 last:border-r-0"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7">
                    {calendarCells.map((day, index) => {
                      const date = day
                        ? formatDate(2026, 8, day)
                        : undefined;

                      const dayTasks = date
                        ? filteredTasks.filter(
                            (task) =>
                              normalizeDate(task.date) === date,
                          )
                        : [];

                      const isToday = day === 20;

                      return (
                        <div
                          key={index}
                          className="min-h-28 border-r border-b border-zinc-200 p-2 last:border-r-0 md:min-h-32"
                        >
                          {day && (
                            <>
                              <div className="mb-2 flex justify-end">
                                <span
                                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                                    isToday
                                      ? "bg-zinc-900 text-white"
                                      : "text-zinc-500"
                                  }`}
                                >
                                  {day}
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                {dayTasks.map((task) => (
                                  <button
                                    key={task.id}
                                    onClick={() =>
                                      setSelectedTask(task)
                                    }
                                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-left transition hover:border-zinc-400 hover:bg-white"
                                  >
                                    <div className="truncate text-xs font-semibold">
                                      {task.title}
                                    </div>

                                    <div className="mt-1 text-[10px] text-zinc-400">
                                      {task.stores} tiendas
                                    </div>

                                    <Status status={task.status} />
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* TAREAS */}
            {activeSection === "Tareas" && (
              <TaskList
                tasks={filteredTasks}
                onSelect={setSelectedTask}
                onCreate={() => setShowModal(true)}
              />
            )}

            {/* TIENDAS */}
            {activeSection === "Tiendas" && <StoreList />}
          </div>
        </section>
      </div>

      {/* CREATE TASK MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Nueva tarea
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Crea una tarea para una o varias tiendas.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              {/* TITULO */}
              <Field label="Título">
                <input
                  value={newTitle}
                  onChange={(event) =>
                    setNewTitle(event.target.value)
                  }
                  placeholder="Ej. Revisar escaparate de verano"
                  className="input"
                />
              </Field>

              {/* DESCRIPCION */}
              <Field label="Descripción">
                <textarea
                  value={newDescription}
                  onChange={(event) =>
                    setNewDescription(event.target.value)
                  }
                  placeholder="Describe qué debe realizar la tienda..."
                  rows={4}
                  className="input resize-none"
                />
              </Field>

              {/* FECHA Y CATEGORIA */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Fecha">
                  <input
                    type="date"
                    value={newDate}
                    onChange={(event) =>
                      setNewDate(event.target.value)
                    }
                    className="input"
                  />
                </Field>

                <Field label="Categoría">
                  <select
                    value={newCategory}
                    onChange={(event) =>
                      setNewCategory(event.target.value)
                    }
                    className="input"
                  >
                    {categories.slice(1).map((category) => (
                      <option key={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* TIENDAS */}
              <Field label="Tiendas">
                <div className="grid gap-2 sm:grid-cols-2">
                  {stores.slice(1).map((store) => {
                    const selected = newStores.includes(store);

                    return (
                      <button
                        key={store}
                        type="button"
                        onClick={() => toggleStore(store)}
                        className={`rounded-xl border p-3 text-left text-sm transition ${
                          selected
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 hover:border-zinc-400"
                        }`}
                      >
                        <div className="font-medium">
                          {store}
                        </div>

                        <div
                          className={`mt-1 text-xs ${
                            selected
                              ? "text-zinc-300"
                              : "text-zinc-400"
                          }`}
                        >
                          {selected
                            ? "Seleccionada"
                            : "Seleccionar tienda"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* BOTONES */}
              <div className="flex justify-end gap-3 border-t border-zinc-100 pt-5">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium hover:bg-zinc-50"
                >
                  Cancelar
                </button>

                <button
                  onClick={createTask}
                  disabled={!newTitle.trim()}
                  className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Crear tarea
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TASK DETAIL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Tarea HQ
                </div>

                <h2 className="mt-1 text-xl font-semibold">
                  {selectedTask.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <DetailRow
                label="Fecha"
                value={normalizeDate(selectedTask.date)}
              />

              <DetailRow
                label="Categoría"
                value={selectedTask.category}
              />

              <DetailRow
                label="Tiendas asignadas"
                value={`${selectedTask.stores} tiendas`}
              />

              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <span className="text-sm text-zinc-500">
                  Estado
                </span>

                <Status status={selectedTask.status} />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="rounded-xl border border-zinc-200 py-3 text-sm font-medium hover:bg-zinc-50">
                💬 Comentarios
              </button>

              <button className="rounded-xl border border-zinc-200 py-3 text-sm font-medium hover:bg-zinc-50">
                📎 Documentos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL INPUT STYLE */}
      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #e4e4e7;
          background: white;
          padding: 0.7rem 0.8rem;
          font-size: 0.875rem;
          outline: none;
        }

        .input:focus {
          border-color: #a1a1aa;
          box-shadow: 0 0 0 3px rgba(161, 161, 170, 0.12);
        }
      `}</style>
    </main>
  );
}

/*
 * STAT
 */
function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium text-zinc-400">
        {label}
      </div>

      <div className="mt-2 text-2xl font-semibold">
        {value}
      </div>

      <div className="mt-1 text-xs text-zinc-400">
        {detail}
      </div>
    </div>
  );
}

/*
 * STATUS
 */
function Status({
  status,
}: {
  status: "Pendiente" | "En progreso" | "Completada";
}) {
  const styles = {
    Pendiente: "bg-amber-50 text-amber-700",
    "En progreso": "bg-blue-50 text-blue-700",
    Completada: "bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`mt-1.5 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/*
 * FIELD
 */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">
        {label}
      </span>

      {children}
    </label>
  );
}

/*
 * DETAIL ROW
 */
function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
      <span className="text-sm text-zinc-500">
        {label}
      </span>

      <span className="text-sm font-medium">
        {value}
      </span>
    </div>
  );
}

/*
 * TASK LIST
 */
function TaskList({
  tasks,
  onSelect,
  onCreate,
}: {
  tasks: Task[];
  onSelect: (task: Task) => void;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-200 p-5">
        <div>
          <h2 className="font-semibold">
            Todas las tareas
          </h2>

          <p className="mt-1 text-xs text-zinc-400">
            Gestiona las tareas creadas por HQ.
          </p>
        </div>

        <button
          onClick={onCreate}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
        >
          + Nueva tarea
        </button>
      </div>

      <div className="divide-y divide-zinc-100">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-400">
            No hay tareas todavía.
          </div>
        ) : (
          tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => onSelect(task)}
              className="flex w-full items-center justify-between p-5 text-left transition hover:bg-zinc-50"
            >
              <div>
                <div className="font-medium">
                  {task.title}
                </div>

                <div className="mt-1 text-xs text-zinc-400">
                  {task.category} ·{" "}
                  {normalizeDate(task.date)}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-zinc-400">
                  {task.stores} tiendas
                </div>

                <Status status={task.status} />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/*
 * STORE LIST
 */
function StoreList() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stores.slice(1).map((store, index) => (
        <div
          key={store}
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Tienda{" "}
                {String(index + 1).padStart(2, "0")}
              </div>

              <h2 className="mt-1 font-semibold">
                {store}
              </h2>
            </div>

            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-zinc-50 p-3">
              <div className="text-xs text-zinc-400">
                Tareas
              </div>

              <div className="mt-1 font-semibold">
                12
              </div>
            </div>

            <div className="rounded-xl bg-zinc-50 p-3">
              <div className="text-xs text-zinc-400">
                Completadas
              </div>

              <div className="mt-1 font-semibold">
                8
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
