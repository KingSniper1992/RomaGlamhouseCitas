"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type SubmitStatus = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    profesion: "",
    primera_vez: false,
    fecha: "",
    servicio: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const { error } = await supabase.from("citas").insert([
      {
        nombre: formData.nombre,
        telefono: formData.telefono,
        profesion: formData.profesion || null,
        primera_vez: formData.primera_vez,
        fecha: formData.fecha,
        servicio: formData.servicio,
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
        servicio: "",
        info_medica: "ninguna",
      });
    }
  };

  return (
    <>
      <main className="flex-grow flex items-center justify-center px-margin-mobile md:px-margin-desktop py-8 z-10">
        <div className="glass-panel soft-shadow rounded-xl w-full max-w-2xl p-8 md:p-12 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-fixed-dim rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary-fixed-dim rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          
          {/* Header */}
          <div className="text-center mb-10 relative z-10">
            <div className="relative h-48 w-full mx-auto mb-6">
              <Image 
                alt="Roma Glam House Logo" 
                className="object-contain" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCThkfUeZG0lJ76xtzw9f5dnHKiQ_mfuQKyiBw_X2bL3X_b9nZ7_CeL2EXUstZKWonLBZvixEPYhIwlIjrmjrSh8Q1gaLOIsN_UHCSuIRgBWnQ1q62UvVgqMHaVw7MOVL273N8RxJsleQWV0xceBoqD_i-EMW9N5OXlLXHTnwHIgQ8f8zO3l0ZquJSoWrEIe-ztNkX1_YRqIG_FMiSDvvuP3l2_VNI7W959oMoa9uNpykejm9r_LR1_mKVaWUauGKEbZQ"
                fill
                priority
              />
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Agendar Cita</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Reserva tu momento de relajación y belleza.</p>
          </div>

          {/* Success State */}
          {status === "success" && (
            <div className="relative z-10 flex flex-col items-center text-center gap-4 py-8 animate-fade-in">
              <span className="material-symbols-outlined text-6xl text-primary-container">check_circle</span>
              <h2 className="font-headline-md text-headline-md text-primary">¡Cita Agendada!</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                Tu cita ha sido registrada con éxito. Pronto nos pondremos en contacto contigo para confirmarla.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-4 bg-primary-container hover:bg-primary text-[#FFD700] font-label-md text-label-md px-6 py-3 rounded transition-all duration-300"
              >
                Agendar otra cita
              </button>
            </div>
          )}

          {/* Booking Form */}
          {status !== "success" && (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="flex flex-col space-y-2">
                  <label className="font-label-md text-label-md text-primary uppercase" htmlFor="nombre">Nombre Completo</label>
                  <input 
                    className="form-input rounded px-4 py-3 font-body-md text-body-md text-on-surface w-full" 
                    id="nombre" 
                    name="nombre" 
                    placeholder="Tu nombre" 
                    required 
                    type="text"
                    value={formData.nombre}
                    onChange={handleChange}
                    disabled={status === "loading"}
                  />
                </div>
                {/* Teléfono */}
                <div className="flex flex-col space-y-2">
                  <label className="font-label-md text-label-md text-primary uppercase" htmlFor="telefono">Teléfono</label>
                  <input 
                    className="form-input rounded px-4 py-3 font-body-md text-body-md text-on-surface w-full" 
                    id="telefono" 
                    name="telefono" 
                    placeholder="Tu número de contacto" 
                    required 
                    type="tel"
                    value={formData.telefono}
                    onChange={handleChange}
                    disabled={status === "loading"}
                  />
                </div>
              </div>
              
              {/* Profesión */}
              <div className="flex flex-col space-y-2">
                <label className="font-label-md text-label-md text-primary uppercase" htmlFor="profesion">Profesión u Ocupación</label>
                <input 
                  className="form-input rounded px-4 py-3 font-body-md text-body-md text-on-surface w-full" 
                  id="profesion" 
                  name="profesion" 
                  placeholder="Para conocerte mejor" 
                  type="text"
                  value={formData.profesion}
                  onChange={handleChange}
                  disabled={status === "loading"}
                />
              </div>
              
              {/* Primera Vez */}
              <div className="flex items-center space-x-3 py-2">
                <input 
                  className="custom-checkbox w-5 h-5 rounded-sm border-outline-variant text-primary-container focus:ring-primary-container focus:ring-offset-background cursor-pointer" 
                  id="primera_vez" 
                  name="primera_vez" 
                  type="checkbox"
                  checked={formData.primera_vez}
                  onChange={handleChange}
                  disabled={status === "loading"}
                />
                <label className="font-body-md text-body-md text-on-surface cursor-pointer select-none" htmlFor="primera_vez">¿Es tu primera vez con nosotros?</label>
              </div>
              
              {/* Fecha y Servicio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fecha */}
                <div className="flex flex-col space-y-2 relative">
                  <label className="font-label-md text-label-md text-primary uppercase" htmlFor="fecha">Fecha Deseada</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline">calendar_today</span>
                    <input 
                      className="form-input rounded pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface w-full" 
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
                {/* Servicio */}
                <div className="flex flex-col space-y-2">
                  <label className="font-label-md text-label-md text-primary uppercase" htmlFor="servicio">Servicio Principal</label>
                  <select 
                    className="form-input rounded px-4 py-3 font-body-md text-body-md text-on-surface w-full appearance-none bg-transparent" 
                    id="servicio" 
                    name="servicio" 
                    required
                    value={formData.servicio}
                    onChange={handleChange}
                    disabled={status === "loading"}
                  >
                    <option disabled value="">Selecciona un servicio...</option>
                    <option value="manicure_spa">Manicure Spa</option>
                    <option value="pedicure_spa">Pedicure Spa</option>
                    <option value="unas_acrilicas">Uñas Acrílicas</option>
                    <option value="gel_semipermanente">Gel Semipermanente</option>
                  </select>
                </div>
              </div>
              
              {/* Botón Añadir Servicio (Simulado) */}
              <div className="flex justify-end">
                <button className="flex items-center space-x-2 text-primary hover:text-primary-container transition-colors duration-300 font-label-md text-label-md" type="button">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Añadir otro servicio</span>
                </button>
              </div>
              
              {/* Información Médica */}
              <div className="flex flex-col space-y-2 pt-4 border-t border-outline-variant/30">
                <label className="font-label-md text-label-md text-primary uppercase" htmlFor="info_medica">Información Médica Relevante</label>
                <select 
                  className="form-input rounded px-4 py-3 font-body-md text-body-md text-on-surface w-full appearance-none bg-transparent" 
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
                <p className="text-label-sm text-outline mt-1">Esta información es confidencial y nos ayuda a brindarte un mejor servicio.</p>
              </div>

              {/* Error Message */}
              {status === "error" && (
                <div className="flex items-center gap-3 bg-error-container/30 border border-error/30 text-on-error-container rounded px-4 py-3 text-body-md font-body-md">
                  <span className="material-symbols-outlined text-error text-[20px]">error</span>
                  {errorMsg}
                </div>
              )}
              
              {/* Submit Button */}
              <div className="pt-6">
                <button 
                  className="w-full bg-primary-container hover:bg-primary text-[#FFD700] font-headline-md text-headline-md py-4 rounded shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0" 
                  type="submit"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      <span>Guardando cita...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmar Cita</span>
                      <span className="material-symbols-outlined">check_circle</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <section className="flex justify-center items-center gap-6 relative z-10 mb-4">
        <a
          href="https://www.instagram.com/romaglamhouse?igsh=MWl4emRlYjBlbGszcA%3D%3D&utm_source=qr"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center rounded-full bg-surface-container-high text-primary-container hover:scale-110 transition-all duration-300 soft-shadow w-16 h-16"
          aria-label="Instagram"
        >
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
        </a>
        <a href="#" className="flex items-center justify-center rounded-full bg-surface-container-high text-primary-container hover:scale-110 transition-all duration-300 soft-shadow w-16 h-16" aria-label="WhatsApp">
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.565.933 3.176 1.423 4.842 1.425h.006c5.435 0 9.857-4.424 9.86-9.86.002-2.633-1.024-5.11-2.888-6.973s-4.341-2.89-6.974-2.891c-5.438 0-9.861 4.424-9.863 9.86-.001 1.862.521 3.675 1.512 5.255l-.995 3.637 3.738-.981zm11.387-5.464c-.301-.15-1.779-.879-2.053-.979-.275-.1-.475-.15-.675.15-.199.299-.772.979-.948 1.174-.175.195-.349.219-.65.07-.301-.15-1.27-.468-2.42-1.494-.894-.797-1.496-1.782-1.672-2.081-.175-.299-.018-.461.132-.61.135-.133.301-.35.451-.524.151-.174.201-.299.301-.498.1-.199.05-.374-.025-.524-.075-.15-.675-1.625-.925-2.225-.244-.589-.491-.51-.675-.519-.174-.009-.374-.01-.574-.01s-.524.075-.798.374c-.275.299-1.047 1.022-1.047 2.492 0 1.47 1.072 2.89 1.222 3.09.15.199 2.111 3.224 5.115 4.526.714.31 1.272.496 1.708.635.716.227 1.368.195 1.883.117.574-.088 1.779-.726 2.028-1.426.25-.7.25-1.296.175-1.425-.075-.13-.275-.205-.575-.355z"></path></svg>
        </a>
      </section>

      <footer className="bg-surface-container border-t border-outline-variant/30 py-8 px-margin-mobile md:px-margin-desktop mt-auto z-10">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-headline-md text-primary uppercase tracking-wider mb-2">Roma Glam House</span>
            <p className="text-label-sm text-outline"><span style={{ color: "rgb(68, 50, 36)", fontSize: "14px", backgroundColor: "rgb(248, 242, 239)" }}>© 2027 Doom Forge Studios</span></p>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a href="/citas" className="text-label-md text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/30 px-3 py-1 rounded-sm hover:bg-surface-container-high">Gestión de Citas</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
