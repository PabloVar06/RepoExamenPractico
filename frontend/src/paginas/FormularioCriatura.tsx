import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerCriatura, guardarCriatura } from "../api/pawneeApi";
import { CriaturaInput, TIPOS, ESTADOS } from "../tipos";
const vacio: CriaturaInput = {
  nombre: "",
  tipo: "mitica",
  habilidades: [],
  nivelPeligro: 5,
  estado: "activa",
};
export function FormularioCriatura() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<CriaturaInput>(vacio),
    [habilidades, setHabilidades] = useState("");
  const [cargando, setCargando] = useState(Boolean(id)),
    [guardando, setGuardando] = useState(false),
    [error, setError] = useState<string | null>(null),
    [fallida, setFallida] = useState(false);
  useEffect(() => {
    let vigente = true;
    setCargando(Boolean(id));
    setError(null);
    setFallida(false);
    setForm(vacio);
    setHabilidades("");
    if (id)
      obtenerCriatura(id)
        .then((c) => {
          if (vigente) {
            setForm({
              nombre: c.nombre,
              tipo: c.tipo,
              habilidades: c.habilidades,
              nivelPeligro: c.nivelPeligro,
              estado: c.estado,
            });
            setHabilidades(c.habilidades.join(", "));
          }
        })
        .catch((e: unknown) => {
          if (vigente) {
            setError(e instanceof Error ? e.message : "Fallo");
            setFallida(true);
          }
        })
        .finally(() => {
          if (vigente) setCargando(false);
        });
    return () => {
      vigente = false;
    };
  }, [id]);
  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const c = await guardarCriatura(id, {
        ...form,
        nombre: form.nombre.trim(),
        habilidades: habilidades
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      });
      navigate(`/criaturas/${c._id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  }
  if (cargando) return <p>Cargando formulario...</p>;
  return (
    <section>
      <h1>{id ? "Editar" : "Crear"} criatura</h1>
      {error && <p role="alert">{error}</p>}
      {!fallida && (
        <form onSubmit={enviar}>
          <fieldset disabled={guardando}>
            <p>
              <label>
                Nombre{" "}
                <input
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </label>
            </p>
            <p>
              <label>
                Tipo{" "}
                <select
                  value={form.tipo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tipo: e.target.value as CriaturaInput["tipo"],
                    })
                  }
                >
                  {TIPOS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
            </p>
            <p>
              <label>
                Habilidades separadas por comas{" "}
                <input
                  value={habilidades}
                  onChange={(e) => setHabilidades(e.target.value)}
                />
              </label>
            </p>
            <p>
              <label>
                Nivel de peligro (1–10){" "}
                <input
                  required
                  type="number"
                  min="1"
                  max="10"
                  value={form.nivelPeligro}
                  onChange={(e) =>
                    setForm({ ...form, nivelPeligro: Number(e.target.value) })
                  }
                />
              </label>
            </p>
            <p>
              <label>
                Estado{" "}
                <select
                  value={form.estado}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      estado: e.target.value as CriaturaInput["estado"],
                    })
                  }
                >
                  {ESTADOS.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
            </p>
            <button type="submit">
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </fieldset>
        </form>
      )}
    </section>
  );
}
