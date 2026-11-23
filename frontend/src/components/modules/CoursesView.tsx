import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Users, Search, Plus, Pencil, Check, X, RefreshCw } from 'lucide-react';
import type { ApiCourse, ApiMeta, CourseLevel, NewCourseInput, ThemeMode, UserRole } from '../../types';
import { createCourse, enrollCourse, listCourses, updateCourse } from '../../services/coursesApi';
import { writeAudit } from '../../services/auditSink';

interface CoursesViewProps {
  theme?: ThemeMode;
  role?: UserRole;
}

const EMPTY_FORM: NewCourseInput = {
  code: '',
  title: '',
  instructor: '',
  level: 'Intermedio',
  description: '',
  capacity: 100,
  status: 'Publicado',
  tags: [],
};

const PAGE_SIZE = 6;

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value.slice(0, 10) : date.toLocaleDateString('es-PE');
}

export const CoursesView: React.FC<CoursesViewProps> = ({ theme = 'monochrome', role = 'estudiante' }) => {
  const isMono = theme === 'monochrome';
  const isLight = theme === 'light';
  const canManage = role !== 'estudiante';

  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [filterLevel, setFilterLevel] = useState<'all' | CourseLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ApiCourse | null>(null);
  const [editing, setEditing] = useState<ApiCourse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewCourseInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    listCourses(controller.signal)
      .then(response => {
        setCourses(response.data);
        setMeta(response.meta);
        setError(null);
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar el catálogo');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [reloadKey]);

  const filtered = useMemo(() => courses.filter(course => {
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query
      || course.title.toLowerCase().includes(query)
      || course.code.toLowerCase().includes(query)
      || course.instructor.toLowerCase().includes(query);
    return matchesLevel && matchesSearch;
  }), [courses, filterLevel, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const reload = () => {
    setLoading(true);
    setReloadKey(key => key + 1);
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setSelected(null);
    setShowForm(true);
  };

  const openEdit = (course: ApiCourse) => {
    setSelected(null);
    setShowForm(true);
    setForm({
      code: course.code,
      title: course.title,
      instructor: course.instructor,
      level: course.level,
      description: course.description,
      capacity: course.capacity,
      status: course.status,
      tags: course.tags,
    });
    setEditing(course);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload: NewCourseInput = {
        ...form,
        code: form.code.trim().toUpperCase(),
        title: form.title.trim(),
        instructor: form.instructor.trim(),
        description: form.description.trim(),
        capacity: Number(form.capacity),
      };
      const response = editing
        ? await updateCourse(editing.id, payload)
        : await createCourse(payload);
      await writeAudit({
        action: editing ? 'courses.updated' : 'courses.created',
        correlationId: response.meta.correlationId,
        onlyDemo: true,
        detail: { id: response.data.id, code: response.data.code, title: response.data.title },
      });
      setNotice(editing ? 'Curso actualizado y auditado.' : 'Curso creado y auditado.');
      setEditing(null);
      setShowForm(false);
      setSelected(null);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el curso');
    } finally {
      setSaving(false);
    }
  };

  const handleEnroll = async (course: ApiCourse) => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const response = await enrollCourse(course.id);
      setCourses(prev => prev.map(item => (item.id === course.id ? response.data : item)));
      setSelected(response.data);
      await writeAudit({
        action: 'courses.enrolled',
        correlationId: response.meta.correlationId,
        onlyDemo: true,
        detail: { id: course.id, actor: 'demo-user' },
      });
      setNotice(`Inscripción registrada en ${course.code}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la inscripción');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = `w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
    isLight
      ? 'bg-white border-slate-300 text-slate-900'
      : isMono
      ? 'bg-[#12141A] border-[#2A2F3D] text-white'
      : 'bg-[#06152B] border-edumaster-cardBorder text-white'
  }`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2 m-0">
            <BookOpen className={`w-5 h-5 ${isLight ? 'text-blue-600' : isMono ? 'text-zinc-200' : 'text-edumaster-blue'}`} />
            Catálogo de Cursos y Contenidos
          </h1>
          <p className={`text-xs mt-1 m-0 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Estado real con filtros, paginación, detalle e inscripción. {meta ? `Fuente: ${meta.source}` : 'Cargando fuente...'}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className={`text-[10px] font-mono px-2 py-1 rounded border ${
            isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-slate-400'
          }`}>
            {meta ? `${meta.source.toUpperCase()} · ${meta.correlationId.slice(0, 10)}` : 'CARGANDO'}
          </span>
          <button
            onClick={reload}
            title="Recargar catálogo"
            className={`p-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {canManage && (
            <button
              onClick={openCreate}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                isMono ? 'bg-white text-zinc-950' : 'bg-edumaster-blue text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> Nuevo curso
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className={`text-xs p-3 rounded-xl border ${isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
          {error}
        </p>
      )}
      {notice && (
        <p className={`text-xs p-3 rounded-xl border ${isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
          {notice}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            aria-label="Buscar curso"
            placeholder="Buscar curso, código o docente..."
            value={searchQuery}
            onChange={event => {
              setSearchQuery(event.target.value);
              setPage(1);
            }}
            className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border focus:outline-none ${inputClass}`}
          />
        </div>
        <div className={`flex p-0.5 rounded-xl border text-xs ${
          isLight ? 'bg-slate-100 border-slate-300' : isMono ? 'bg-[#181C26] border-[#2A2F3D]' : 'bg-[#0A1F3D] border-edumaster-cardBorder'
        }`}>
          {(['all', 'Básico', 'Intermedio', 'Avanzado'] as const).map(level => (
            <button
              key={level}
              onClick={() => {
                setFilterLevel(level);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg font-bold ${
                filterLevel === level
                  ? isLight ? 'bg-white text-slate-900' : isMono ? 'bg-white text-zinc-950' : 'bg-edumaster-blue text-white'
                  : isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {level === 'all' ? 'Todos' : level}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Cargando catálogo...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map(course => (
              <div
                key={course.id}
                onClick={() => setSelected(course)}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-sm hover:border-slate-300 text-slate-900'
                    : isMono
                    ? 'bg-[#151821] border-[#2A2F3D] hover:border-[#3B4254] text-zinc-100'
                    : 'glass-panel border-edumaster-cardBorder hover:border-edumaster-cyan/40 text-slate-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                      isLight ? 'bg-blue-50 border-blue-200 text-blue-700' : isMono ? 'bg-[#242A38] border-[#3B4254] text-white' : 'bg-edumaster-blue/20 border-edumaster-cyan/40 text-edumaster-cyan'
                    }`}>
                      {course.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      course.level === 'Avanzado'
                        ? isLight ? 'bg-purple-50 border-purple-200 text-purple-800' : 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                        : course.level === 'Intermedio'
                        ? isLight ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                        : isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    }`}>
                      {course.level}
                    </span>
                  </div>
                  <h3 className="text-sm font-black mb-1.5 leading-snug">{course.title}</h3>
                  <p className={`text-xs mb-3 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Docente: {course.instructor}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {course.tags.map(tag => (
                      <span key={tag} className={`text-[10px] px-2 py-0.5 rounded border ${
                        isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : isMono ? 'bg-[#1C202B] border-[#2A2F3D] text-zinc-300' : 'bg-[#06152B] border-edumaster-cardBorder text-slate-300'
                      }`}>#{tag}</span>
                    ))}
                  </div>
                </div>
                <div className={`pt-3 border-t flex items-center justify-between text-xs ${isLight ? 'border-slate-100' : isMono ? 'border-[#2A2F3D]' : 'border-edumaster-cardBorder/60'}`}>
                  <div className={`flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-mono">{course.students.toLocaleString()} / {course.capacity.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {course.enrolled && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    <span className={`font-mono font-black ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      {course.completionRate}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {visible.length === 0 && (
              <p className={`text-xs col-span-full ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                No hay cursos que coincidan con los filtros.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
              {filtered.length} curso(s) · página {currentPage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage(value => Math.max(1, value - 1))}
                className={`px-3 py-1.5 rounded-lg border disabled:opacity-40 ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}
              >
                Anterior
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setPage(value => Math.min(totalPages, value + 1))}
                className={`px-3 py-1.5 rounded-lg border disabled:opacity-40 ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-lg p-6 rounded-2xl border ${isLight ? 'bg-white border-slate-300 text-slate-900' : isMono ? 'bg-[#151821] border-[#3B4254] text-white' : 'bg-[#0A1F3D] border-edumaster-cyan/40 text-white'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded border">{selected.code}</span>
                <h2 className="text-base font-black mt-2 mb-1">{selected.title}</h2>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{selected.instructor} · {selected.level}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            <p className={`text-xs mt-4 leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{selected.description}</p>
            <div className={`grid grid-cols-3 gap-3 mt-4 p-3 rounded-xl border text-center ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
              <div><span className="block text-[10px] opacity-60">Inscritos</span><span className="font-mono font-bold text-xs">{selected.students}</span></div>
              <div><span className="block text-[10px] opacity-60">Cupo</span><span className="font-mono font-bold text-xs">{selected.capacity}</span></div>
              <div><span className="block text-[10px] opacity-60">Éxito</span><span className="font-mono font-bold text-xs">{selected.completionRate}%</span></div>
            </div>
            <p className={`text-[10px] font-mono mt-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Creado: {formatDate(selected.createdAt)} · {selected.tags.join(', ') || 'sin etiquetas'}
            </p>
            <div className="flex gap-2 mt-5">
              {canManage && (
                <button
                  onClick={() => openEdit(selected)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${isMono ? 'bg-white text-zinc-950' : 'bg-edumaster-blue text-white'}`}
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
              )}
              <button
                disabled={selected.enrolled || saving}
                onClick={() => void handleEnroll(selected)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 ${
                  isMono ? 'bg-white text-zinc-950' : isLight ? 'bg-slate-900 text-white' : 'bg-edumaster-blue text-white'
                }`}
              >
                <Check className="w-3.5 h-3.5" /> {selected.enrolled ? 'Inscrito' : 'Inscribirme'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form onSubmit={event => void handleSave(event)} className={`w-full max-w-xl p-6 rounded-2xl border space-y-3 ${isLight ? 'bg-white border-slate-300 text-slate-900' : isMono ? 'bg-[#151821] border-[#3B4254] text-white' : 'bg-[#0A1F3D] border-edumaster-cyan/40 text-white'}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black m-0">{editing ? 'Editar curso' : 'Nuevo curso'}</h2>
              <button
                type="button"
                onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm(false); }}
                className="p-1.5 rounded-lg hover:bg-white/10"
              ><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs">Código<input className={inputClass} value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="QA-900" required /></label>
              <label className="text-xs">Nivel<select className={inputClass} value={form.level} onChange={e => setForm({ ...form, level: e.target.value as CourseLevel })}><option>Básico</option><option>Intermedio</option><option>Avanzado</option></select></label>
            </div>
            <label className="text-xs block">Título<input className={inputClass} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs">Docente<input className={inputClass} value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} required /></label>
              <label className="text-xs">Cupo<input type="number" min={1} className={inputClass} value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} required /></label>
            </div>
            <label className="text-xs block">Descripción<textarea className={inputClass} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required /></label>
            <label className="text-xs block">Etiquetas (separadas por coma)<input className={inputClass} value={form.tags.join(', ')} onChange={e => setForm({ ...form, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) })} /></label>
            <label className="text-xs block">Estado<select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as NewCourseInput['status'] })}><option>Publicado</option><option>Borrador</option></select></label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm(false); }} className={`px-3 py-2 rounded-xl text-xs border ${isLight ? 'border-slate-300' : 'border-white/10'}`}>Cancelar</button>
              <button type="submit" disabled={saving} className={`px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40 ${isMono ? 'bg-white text-zinc-950' : 'bg-edumaster-blue text-white'}`}>
                {saving ? 'Guardando...' : 'Guardar curso'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
