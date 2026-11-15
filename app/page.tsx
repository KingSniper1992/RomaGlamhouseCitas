"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type SubmitStatus = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    profesion: "",
    primera_vez: false,
    fecha: "",
    servicios: [""],
    info_medica: "ninguna",
  });

  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleServicioChange = (index: number, value: string) => {
    const newServicios = [...formData.servicios];
    newServicios[index] = value;
    setFormData((prev) => ({ ...prev, servicios: newServicios }));
  };

  const addServicio = () => {
    setFormData((prev) => ({ ...prev, servicios: [...prev.servicios, ""] }));
  };

  const removeServicio = (index: number) => {
    const newServicios = [...formData.servicios];
    newServicios.splice(index, 1);
    setFormData((prev) => ({ ...prev, servicios: newServicios }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const serviciosFiltrados = formData.servicios.filter((s) => s !== "");
    const servicioprincipal = serviciosFiltrados[0] ?? "";
    const adicionales = serviciosFiltrados.slice(1);

    const { error } = await supabase.from("citas").insert([
      {
        nombre: formData.nombre,
        telefono: formData.telefono,
        profesion: formData.profesion || null,
        primera_vez: formData.primera_vez,
        fecha: formData.fecha,
        servicio: servicioprincipal,
        servicios_adicionales: adicionales.length > 0 ? adicionales : null,
        info_medica: formData.info_medica,
      },
    ]);

    if (error) {
      console.error("Error al guardar la cita:", error);
      setErrorMsg("Ocurrió un error al agendar tu cita. Por favor intenta de nuevo.");
      setStatus("error");
    } else {
      setStatus("success");
      setFormData({
        nombre: "",
        telefono: "",
        profesion: "",
        primera_vez: false,
        fecha: "",
        servicios: [""],
        info_medica: "ninguna",
      });
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col justify-between py-3 md:py-5 lg:py-3 px-4 md:px-8 lg:px-12 relative overflow-x-hidden">
      {/* Contenedor Principal */}
      <main className="flex-1 flex items-center justify-center z-10 w-full my-auto py-2">
        <div className="glass-panel soft-shadow rounded-2xl w-full max-w-5xl xl:max-w-6xl p-5 sm:p-7 lg:p-6 relative overflow-hidden flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch">
          {/* Elementos Decorativos */}
          <div className="absolute -top-10 -left-10 w-44 h-44 bg-primary-fixed-dim rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
          <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-secondary-fixed-dim rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>

          {/* Columna Izquierda: Identidad de Marca y Redes */}
          <div className="lg:w-4/12 xl:w-4/12 flex flex-col justify-between items-center text-center p-5 sm:p-6 rounded-xl bg-surface-container-low/70 border border-outline-variant/30 relative z-10">
            <div className="w-full flex flex-col items-center">
              <div className="relative h-24 sm:h-32 lg:h-36 w-full max-w-[200px] mx-auto mb-2">
                <Image
                  alt="Roma Glam House Logo"
                  className="object-contain drop-shadow-md scale-105"
                  src="/logo.png"
                  fill
                  priority
                />
              </div>
              <h1 className="font-headline-lg text-2xl sm:text-3xl lg:text-3xl text-primary font-bold mb-1">
                Roma Glam House
              </h1>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-xs">
                Reserva tu momento de relajación, cuidado y belleza personalizada.
              </p>

              {/* Beneficios sutiles (visibles en desktop) */}
              <div className="hidden lg:flex flex-col gap-2 mt-4 w-full text-left text-xs text-on-surface-variant/80 border-t border-outline-variant/30 pt-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[17px]">verified</span>
                  <span>Profesionales certificadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[17px]">spa</span>
                  <span>Productos y técnicas de vanguardia</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[17px]">schedule</span>
                  <span>Atención puntual y garantizada</span>
                </div>
              </div>
            </div>

            {/* Redes Sociales y Acceso Rápido */}
            <div className="w-full mt-4 pt-3 border-t border-outline-variant/30 flex flex-col items-center gap-2.5">
              <div className="flex items-center justify-center gap-3">
                <a
                  href="https://www.instagram.com/romaglamhouse?igsh=MWl4emRlYjBlbGszcA%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-full bg-surface-container-high text-primary-container hover:scale-110 hover:text-primary transition-all duration-300 soft-shadow w-10 h-10"
                  aria-label="Instagram"
                  title="Síguenos en Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
                </a>
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-full bg-surface-container-high text-primary-container hover:scale-110 hover:text-primary transition-all duration-300 soft-shadow w-10 h-10"
                  aria-label="WhatsApp"
                  title="Escríbenos por WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.565.933 3.176 1.423 4.842 1.425h.006c5.435 0 9.857-4.424 9.86-9.86.002-2.633-1.024-5.11-2.888-6.973s-4.341-2.89-6.974-2.891c-5.438 0-9.861 4.424-9.863 9.86-.001 1.862.521 3.675 1.512 5.255l-.995 3.637 3.738-.981zm11.387-5.464c-.301-.15-1.779-.879-2.053-.979-.275-.1-.475-.15-.675.15-.199.299-.772.979-.948 1.174-.175.195-.349.219-.65.07-.301-.15-1.27-.468-2.42-1.494-.894-.797-1.496-1.782-1.672-2.081-.175-.299-.018-.461.132-.61.135-.133.301-.35.451-.524.151-.174.201-.299.301-.498.1-.199.05-.374-.025-.524-.075-.15-.675-1.625-.925-2.225-.244-.589-.491-.51-.675-.519-.174-.009-.374-.01-.574-.01s-.524.075-.798.374c-.275.299-1.047 1.022-1.047 2.492 0 1.47 1.072 2.89 1.222 3.09.15.199 2.111 3.224 5.115 4.526.714.31 1.272.496 1.708.635.716.227 1.368.195 1.883.117.574-.088 1.779-.726 2.028-1.426.25-.7.25-1.296.175-1.425-.075-.13-.275-.205-.575-.355z"></path></svg>
                </a>
              </div>
              <Link
                href="/citas"
                className="text-xs text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/30 px-3 py-1 rounded hover:bg-surface-container-high"
              >
                Gestión de Citas
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Formulario o Éxito */}
          <div className="lg:w-8/12 xl:w-8/12 flex flex-col justify-center relative z-10">
            {/* Estado de Éxito */}
            {status === "success" && (
              <div className="flex flex-col items-center text-center gap-3 py-6 animate-fade-in my-auto">
                <span className="material-symbols-outlined text-5xl sm:text-6xl text-primary-container">check_circle</span>
                <h2 className="font-headline-md text-xl sm:text-2xl text-primary font-bold">¡Cita Agendada con Éxito!</h2>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-sm">
                  Tu solicitud ha sido registrada correctamente. Nos pondremos en contacto contigo para coordinar y confirmar los detalles.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-3 bg-primary-container hover:bg-primary text-[#FFD700] font-label-md text-xs sm:text-sm px-6 py-2.5 rounded transition-all duration-300"
                >
                  Agendar otra cita
                </button>
              </div>
            )}

            {/* Formulario */}
            {status !== "success" && (
              <div>
                <div className="mb-2 sm:mb-3">
                  <h2 className="font-headline-md text-lg sm:text-xl lg:text-2xl text-primary font-bold">
                    Agendar Cita
                  </h2>
                  <p className="text-xs sm:text-sm text-on-surface-variant">
                    Por favor completa los siguientes campos para apartar tu turno.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
                  {/* Fila 1: Nombre y Teléfono */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="flex flex-col space-y-1">
                      <label className="font-label-md text-xs text-primary uppercase" htmlFor="nombre">
                        Nombre Completo *
                      </label>
                      <input
                        className="form-input rounded px-3 py-2 text-sm text-on-surface w-full"
                        id="nombre"
                        name="nombre"
                        placeholder="Ej. María Pérez"
                        required
                        type="text"
                        value={formData.nombre}
                        onChange={handleChange}
                        disabled={status === "loading"}
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="font-label-md text-xs text-primary uppercase" htmlFor="telefono">
                        Teléfono / WhatsApp *
                      </label>
                      <input
                        className="form-input rounded px-3 py-2 text-sm text-on-surface w-full"
                        id="telefono"
                        name="telefono"
                        placeholder="Ej. 300 123 4567"
                        required
                        type="tel"
                        value={formData.telefono}
                        onChange={handleChange}
                        disabled={status === "loading"}
                      />
                    </div>
                  </div>

                  {/* Fila 2: Profesión y Fecha Deseada */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="flex flex-col space-y-1">
                      <label className="font-label-md text-xs text-primary uppercase" htmlFor="profesion">
                        Profesión u Ocupación
                      </label>
                      <input
                        className="form-input rounded px-3 py-2 text-sm text-on-surface w-full"
                        id="profesion"
                        name="profesion"
                        placeholder="Para conocerte mejor"
                        type="text"
                        value={formData.profesion}
                        onChange={handleChange}
                        disabled={status === "loading"}
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="font-label-md text-xs text-primary uppercase" htmlFor="fecha">
                        Fecha Deseada *
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-2.5 top-1/2 transform -translate-y-1/2 text-outline text-[18px]">
                          calendar_today
                        </span>
                        <input
                          className="form-input rounded pl-9 pr-3 py-2 text-sm text-on-surface w-full"
                          id="fecha"
                          name="fecha"
                          required
                          type="date"
                          value={formData.fecha}
                          onChange={handleChange}
                          disabled={status === "loading"}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fila 3: Servicios e Información Médica */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 items-start">
                    {/* Servicios */}
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-label-md text-xs text-primary uppercase">
                          Servicio(s) *
                        </label>
                        <button
                          className="flex items-center gap-1 text-primary hover:text-primary-container transition-colors font-label-sm text-[11px] disabled:opacity-50"
                          type="button"
                          onClick={addServicio}
                          disabled={formData.servicios[formData.servicios.length - 1] === "" || status === "loading"}
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          <span>Añadir otro</span>
                        </button>
                      </div>

                      <div className="flex flex-col space-y-1.5 max-h-24 sm:max-h-28 overflow-y-auto pr-1">
                        {formData.servicios.map((servicio, index) => (
                          <div key={index} className="flex items-center space-x-1.5">
                            <select
                              className="form-input rounded px-3 py-2 text-sm text-on-surface w-full appearance-none bg-transparent"
                              required
                              value={servicio}
                              onChange={(e) => handleServicioChange(index, e.target.value)}
                              disabled={status === "loading"}
                            >
                              <option disabled value="">{index === 0 ? "Selecciona un servicio..." : "Selecciona otro servicio..."}</option>
                              <option value="manicure_spa">Manicure Spa</option>
                              <option value="pedicure_spa">Pedicure Spa</option>
                              <option value="unas_acrilicas">Uñas Acrílicas</option>
                              <option value="gel_semipermanente">Gel Semipermanente</option>
                            </select>
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => removeServicio(index)}
                                className="text-error hover:text-error/80 transition-colors p-1 flex-shrink-0"
                                title="Eliminar servicio"
                                disabled={status === "loading"}
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Información Médica */}
                    <div className="flex flex-col space-y-1">
                      <label className="font-label-md text-xs text-primary uppercase" htmlFor="info_medica">
                        Información Médica
                      </label>
                      <select
                        className="form-input rounded px-3 py-2 text-sm text-on-surface w-full appearance-none bg-transparent"
                        id="info_medica"
                        name="info_medica"
                        value={formData.info_medica}
                        onChange={handleChange}
                        disabled={status === "loading"}
                      >
                        <option value="ninguna">Ninguna condición relevante</option>
                        <option value="diabetes">Diabetes</option>
                        <option value="onicomicosis">Onicomicosis (Hongos)</option>
                        <option value="una_encarnada">Uña Encarnada</option>
                        <option value="alergias">Alergias a productos químicos</option>
                        <option value="otra">Otra (Especificar al llegar)</option>
                      </select>
                      <span className="text-[10px] text-outline leading-tight">
                        Confidencial para brindarte un servicio seguro.
                      </span>
                    </div>
                  </div>

                  {/* Checkbox Primera Vez */}
                  <div className="flex items-center space-x-2 py-0.5">
                    <input
                      className="custom-checkbox w-4 h-4 rounded-sm border-outline-variant text-primary-container focus:ring-primary-container focus:ring-offset-background cursor-pointer"
                      id="primera_vez"
                      name="primera_vez"
                      type="checkbox"
                      checked={formData.primera_vez}
                      onChange={handleChange}
                      disabled={status === "loading"}
                    />
                    <label className="text-xs sm:text-sm text-on-surface cursor-pointer select-none" htmlFor="primera_vez">
                      ¿Es tu primera vez con nosotros?
                    </label>
                  </div>

                  {/* Mensaje de Error */}
                  {status === "error" && (
                    <div className="flex items-center gap-2 bg-error-container/30 border border-error/30 text-on-error-container rounded px-3 py-2 text-xs">
                      <span className="material-symbols-outlined text-error text-[18px]">error</span>
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Botón de Enviar */}
                  <div className="pt-1">
                    <button
                      className="w-full bg-primary-container hover:bg-primary text-[#FFD700] font-headline-md text-base sm:text-lg py-2.5 sm:py-3 rounded shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      type="submit"
                      disabled={status === "loading"}
                    >
                      {status === "loading" ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                          <span>Guardando cita...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirmar Cita</span>
                          <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Compacto */}
      <footer className="w-full max-w-5xl xl:max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-outline py-1.5 sm:py-2 border-t border-outline-variant/20 z-10 gap-1 sm:gap-0">
        <span>Roma Glam House • © 2027 Doom Forge Studios</span>
        <div className="flex items-center gap-3">
          <Link href="/citas" className="hover:text-primary transition-colors">
            Gestión de Citas
          </Link>
          <span>•</span>
          <a
            href="https://www.instagram.com/romaglamhouse?igsh=MWl4emRlYjBlbGszcA%3D%3D&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Instagram
          </a>
        </div>
      </footer>
    </div>
  );
}
