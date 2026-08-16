"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Cita {
  id: string;
  nombre: string;
  telefono: string;
  profesion: string | null;
  primera_vez: boolean;
  fecha: string;
  servicio: string;
  servicios_adicionales: string[] | null;
  info_medica: string | null;
  estado: string | null;
  notas: string | null;
  created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

function formatFecha(fecha: string): string {
  if (!fecha) return "—";
  const [year, month, day] = fecha.split("-");
  const months = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];
  return `${parseInt(day)} ${months[parseInt(month) - 1]}, ${year}`;
}

function formatServicio(servicio: string): string {
  const map: Record<string, string> = {
    manicure_spa: "Manicure Spa",
    pedicure_spa: "Pedicure Spa",
    unas_acrilicas: "Uñas Acrílicas",
    gel_semipermanente: "Gel Semipermanente",
  };
  return map[servicio] ?? servicio;
}

function formatInfoMedica(info: string | null): string {
  if (!info) return "Ninguna";
  const map: Record<string, string> = {
    ninguna: "Ninguna",
    diabetes: "Diabetes",
    onicomicosis: "Onicomicosis",
    una_encarnada: "Uña Encarnada",
    alergias: "Alergias",
    otra: "Otra",
  };
  return map[info] ?? info;
}

function estadoBadge(estado: string | null) {
  const base =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  switch ((estado ?? "pendiente").toLowerCase()) {
    case "confirmada":
      return <span className={`${base} bg-green-100 text-green-800`}>Confirmada</span>;
    case "cancelada":
      return <span className={`${base} bg-red-100 text-red-800`}>Cancelada</span>;
    default:
      return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pendiente</span>;
  }
}

// ─── Medical Info Modal ───────────────────────────────────────────────────────

function MedicalModal({ cita, onClose }: { cita: Cita; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-xl border border-surface-variant w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-outline hover:text-error transition-colors" aria-label="Cerrar">
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-primary text-3xl">medical_information</span>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary leading-tight">{cita.nombre}</h3>
            <p className="text-label-sm text-outline">{cita.telefono}</p>
          </div>
        </div>
        <div className="space-y-3 text-body-md font-body-md">
          <div className="flex justify-between border-b border-surface-variant pb-2">
            <span className="text-on-surface-variant">Condición médica</span>
            <span className="font-medium text-on-surface">{formatInfoMedica(cita.info_medica)}</span>
          </div>
          {cita.notas && (
            <div className="border-b border-surface-variant pb-2">
              <span className="text-on-surface-variant block mb-1">Notas</span>
              <p className="text-on-surface">{cita.notas}</p>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Fecha de cita</span>
            <span className="font-medium text-on-surface">{formatFecha(cita.fecha)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({ cita, onConfirm, onClose }: { cita: Cita; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-xl border border-surface-variant w-full max-w-sm p-6 relative">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <span className="material-symbols-outlined text-error text-5xl">delete_forever</span>
          <h3 className="font-headline-md text-headline-md text-on-surface">¿Eliminar cita?</h3>
          <p className="text-body-md font-body-md text-on-surface-variant">
            Se eliminará la cita de <span className="font-semibold text-primary">{cita.nombre}</span> del {formatFecha(cita.fecha)}. Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-outline-variant text-on-surface rounded hover:bg-surface-container-low transition-colors font-label-md">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-error text-on-error rounded hover:opacity-90 transition-colors font-label-md">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ cita, onSave, onClose }: { cita: Cita; onSave: (u: Partial<Cita>) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState({
    nombre: cita.nombre,
    telefono: cita.telefono,
    profesion: cita.profesion ?? "",
    fecha: cita.fecha,
    servicio: cita.servicio,
    estado: cita.estado ?? "pendiente",
    info_medica: cita.info_medica ?? "ninguna",
    notas: cita.notas ?? "",
    primera_vez: cita.primera_vez,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((p) => ({ ...p, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, profesion: form.profesion || null });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface rounded-xl shadow-xl border border-surface-variant w-full max-w-lg p-6 relative my-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-outline hover:text-error transition-colors" aria-label="Cerrar">
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-primary">edit</span>
          <h3 className="font-headline-md text-headline-md text-primary">Editar Cita</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-primary uppercase">Nombre</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} required className="form-input rounded px-3 py-2 text-body-md font-body-md text-on-surface w-full" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-primary uppercase">Teléfono</label>
              <input name="telefono" value={form.telefono} onChange={handleChange} required className="form-input rounded px-3 py-2 text-body-md font-body-md text-on-surface w-full" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-primary uppercase">Profesión</label>
            <input name="profesion" value={form.profesion} onChange={handleChange} className="form-input rounded px-3 py-2 text-body-md font-body-md text-on-surface w-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-primary uppercase">Fecha</label>
              <input name="fecha" type="date" value={form.fecha} onChange={handleChange} required className="form-input rounded px-3 py-2 text-body-md font-body-md text-on-surface w-full" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-primary uppercase">Servicio</label>
              <select name="servicio" value={form.servicio} onChange={handleChange} required className="form-input rounded px-3 py-2 text-body-md font-body-md text-on-surface w-full appearance-none bg-transparent">
                <option value="manicure_spa">Manicure Spa</option>
                <option value="pedicure_spa">Pedicure Spa</option>
                <option value="unas_acrilicas">Uñas Acrílicas</option>
                <option value="gel_semipermanente">Gel Semipermanente</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-primary uppercase">Estado</label>
              <select name="estado" value={form.estado} onChange={handleChange} className="form-input rounded px-3 py-2 text-body-md font-body-md text-on-surface w-full appearance-none bg-transparent">
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-primary uppercase">Info Médica</label>
              <select name="info_medica" value={form.info_medica} onChange={handleChange} className="form-input rounded px-3 py-2 text-body-md font-body-md text-on-surface w-full appearance-none bg-transparent">
                <option value="ninguna">Ninguna</option>
                <option value="diabetes">Diabetes</option>
                <option value="onicomicosis">Onicomicosis</option>
                <option value="una_encarnada">Uña Encarnada</option>
                <option value="alergias">Alergias</option>
                <option value="otra">Otra</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input id="edit-primera_vez" name="primera_vez" type="checkbox" checked={form.primera_vez} onChange={handleChange} className="custom-checkbox w-4 h-4 rounded-sm" />
            <label htmlFor="edit-primera_vez" className="text-body-md font-body-md text-on-surface cursor-pointer">Primera vez</label>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-primary uppercase">Notas</label>
            <textarea name="notas" value={form.notas} onChange={handleChange} rows={2} className="form-input rounded px-3 py-2 text-body-md font-body-md text-on-surface w-full resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-outline-variant text-on-surface rounded hover:bg-surface-container-low transition-colors font-label-md">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-primary-container text-on-primary rounded hover:bg-primary transition-colors font-label-md disabled:opacity-60">
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CitasPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [medicalModal, setMedicalModal] = useState<Cita | null>(null);
  const [editModal, setEditModal] = useState<Cita | null>(null);
  const [deleteModal, setDeleteModal] = useState<Cita | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const fetchCitas = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase
      .from("citas")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (search.trim()) {
      query = query.ilike("nombre", `%${search.trim()}%`);
    }
    const { data, error: err, count } = await query;
    if (err) {
      setError("No se pudo cargar la información. Intenta de nuevo.");
    } else {
      setCitas((data as Cita[]) ?? []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchCitas(); }, [fetchCitas]);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    const { error: err } = await supabase.from("citas").delete().eq("id", deleteModal.id);
    if (err) { showToast("Error al eliminar la cita.", "err"); }
    else { showToast("Cita eliminada correctamente."); setDeleteModal(null); fetchCitas(); }
  };

  const handleEdit = async (updated: Partial<Cita>) => {
    if (!editModal) return;
    const { error: err } = await supabase.from("citas").update(updated).eq("id", editModal.id);
    if (err) { showToast("Error al guardar los cambios.", "err"); }
    else { showToast("Cita actualizada correctamente."); setEditModal(null); fetchCitas(); }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE + PAGE_SIZE, total);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setSearch(e.target.value);
  };

  return (
    <>
      {/* Nav */}
      <nav className="bg-surface shadow-[0px_10px_30px_rgba(130,49,61,0.05)] w-full sticky top-0 z-40">
        <div className="flex justify-between items-center w-full px-margin-desktop max-w-container-max mx-auto h-20">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-container text-on-primary rounded hover:opacity-90 transition-colors font-label-md">
              <span className="material-symbols-outlined">arrow_back</span>
              Regresar al Formulario
            </Link>
          </div>
          <span className="font-headline-md text-primary italic hidden sm:block">Roma Glam House</span>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-grow px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Gestión de Citas</h1>
            <p className="text-on-surface-variant font-body-md">Administra y supervisa las reservas de tus clientes.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                id="search-input"
                type="text"
                placeholder="Buscar cliente..."
                value={search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors font-body-md text-on-surface placeholder:text-outline"
              />
            </div>
            <button onClick={() => fetchCitas()} className="flex items-center justify-center gap-2 px-4 py-2 border border-primary-container text-primary-container rounded hover:bg-surface-container-low transition-colors font-label-md">
              <span className="material-symbols-outlined">refresh</span>
              Actualizar
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface rounded-xl shadow-[0px_10px_30px_rgba(130,49,61,0.03)] border border-surface-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-surface-variant text-on-surface-variant font-label-md">
                  <th className="px-6 py-4 font-semibold">Cliente</th>
                  <th className="px-6 py-4 font-semibold">Teléfono</th>
                  <th className="px-6 py-4 font-semibold">Servicio</th>
                  <th className="px-6 py-4 font-semibold">Profesión</th>
                  <th className="px-6 py-4 font-semibold">Primera Vez</th>
                  <th className="px-6 py-4 font-semibold">Fecha</th>
                  <th className="px-6 py-4 font-semibold">Info Médica</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-on-surface divide-y divide-surface-variant">
                {loading && (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-on-surface-variant">
                        <span className="material-symbols-outlined text-4xl animate-spin text-primary-container">progress_activity</span>
                        <span>Cargando citas...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-error">
                        <span className="material-symbols-outlined text-4xl">error</span>
                        <span>{error}</span>
                        <button onClick={fetchCitas} className="text-primary-container underline text-label-md">Reintentar</button>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && !error && citas.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-on-surface-variant">
                        <span className="material-symbols-outlined text-4xl">event_busy</span>
                        <span>No se encontraron citas.</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && !error && citas.map((cita) => (
                  <tr key={cita.id} className="hover:bg-surface-bright transition-colors duration-200">
                    <td className="px-6 py-4"><span className="font-medium text-primary">{cita.nombre}</span></td>
                    <td className="px-6 py-4 text-on-surface-variant">{cita.telefono}</td>
                    <td className="px-6 py-4">{formatServicio(cita.servicio)}</td>
                    <td className="px-6 py-4">{cita.profesion ?? <span className="text-outline">—</span>}</td>
                    <td className="px-6 py-4 text-center">
                      {cita.primera_vez
                        ? <span className="material-symbols-outlined text-green-800">check_circle</span>
                        : <span className="material-symbols-outlined text-outline">cancel</span>}
                    </td>
                    <td className="px-6 py-4">{formatFecha(cita.fecha)}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => setMedicalModal(cita)} className="text-primary hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">medical_information</span>
                        Ver
                      </button>
                    </td>
                    <td className="px-6 py-4">{estadoBadge(cita.estado)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditModal(cita)} className="p-1 text-outline hover:text-primary transition-colors" title="Editar">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => setDeleteModal(cita)} className="p-1 text-outline hover:text-error transition-colors" title="Borrar">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-surface-container-low px-6 py-4 border-t border-surface-variant flex items-center justify-between">
            <span className="text-sm text-on-surface-variant">
              {total === 0 ? "Sin resultados" : `Mostrando ${from} a ${to} de ${total} cita${total !== 1 ? "s" : ""}`}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="p-1 rounded text-outline hover:bg-surface hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Anterior">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="text-sm text-on-surface-variant">{totalPages > 0 ? `${page + 1} / ${totalPages}` : "—"}</span>
              <button onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))} disabled={page + 1 >= totalPages} className="p-1 rounded text-outline hover:bg-surface hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Siguiente">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low py-12 mt-auto border-t border-surface-variant">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-desktop max-w-container-max mx-auto gap-6">
          <div className="font-display-lg text-headline-md text-primary italic">Roma Glam House</div>
          <div className="text-tertiary font-body-md text-sm">© 2027 Doom Forge Studios</div>
        </div>
      </footer>

      {/* Modals */}
      {medicalModal && <MedicalModal cita={medicalModal} onClose={() => setMedicalModal(null)} />}
      {editModal && <EditModal cita={editModal} onSave={handleEdit} onClose={() => setEditModal(null)} />}
      {deleteModal && <DeleteModal cita={deleteModal} onConfirm={handleDelete} onClose={() => setDeleteModal(null)} />}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg font-body-md text-body-md ${toast.type === "ok" ? "bg-green-800 text-white" : "bg-error text-on-error"}`}>
          <span className="material-symbols-outlined">{toast.type === "ok" ? "check_circle" : "error"}</span>
          {toast.msg}
        </div>
      )}
    </>
  );
}
