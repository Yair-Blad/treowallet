
import { useEffect, useState } from "react";
import "../styles/Beneficiaries.css";

import {
  getBeneficiaries,
  createBeneficiary,
  deleteBeneficiary,
  type Beneficiary,
} from "../services/api";

interface BeneficiariesProps {
  token: string;
}

const isValidClabe = (clabe: string): boolean => {
  if (!/^\d{18}$/.test(clabe)) {
    return false;
  }

  const weights = [3, 7, 1];
  let sum = 0;

  for (let i = 0; i < 17; i++) {
    const product = Number(clabe[i]) * weights[i % 3];
    sum += product % 10;
  }

  const checkDigit = (10 - (sum % 10)) % 10;

  return checkDigit === Number(clabe[17]);
};

function Beneficiaries({ token }: BeneficiariesProps) {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [alias, setAlias] = useState("");
  const [clabe, setClabe] = useState("");

  const loadBeneficiaries = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getBeneficiaries(token);
      setBeneficiaries(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible consultar los beneficiarios"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getBeneficiaries(token);

        if (active) {
          setBeneficiaries(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "No fue posible consultar los beneficiarios"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [token]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = beneficiaryName.trim();
    const beneficiaryAlias = alias.trim();
    const cleanClabe = clabe.trim();

    if (!name || !beneficiaryAlias || !cleanClabe) {
      setError("Completa todos los campos.");
      return;
    }

    if (!isValidClabe(cleanClabe)) {
      setError("La CLABE no es válida. Verifica sus 18 dígitos.");
      return;
    }

    try {
      setSaving(true);

      const response = await createBeneficiary(
        token,
        name,
        beneficiaryAlias,
        cleanClabe
      );

      if (response.beneficiary) {
        setBeneficiaries((current) => [
          response.beneficiary!,
          ...current,
        ]);
      } else {
        await loadBeneficiaries();
      }

      setBeneficiaryName("");
      setAlias("");
      setClabe("");

      setSuccess(response.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible registrar el beneficiario"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de eliminar este beneficiario?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      setDeletingId(id);

      const response = await deleteBeneficiary(token, id);

      setBeneficiaries((current) =>
        current.filter((beneficiary) => beneficiary.id !== id)
      );

      setSuccess(response.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible eliminar el beneficiario"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="beneficiaries-page">
      <div className="beneficiaries-header">
        <div>
          <h2>Mis beneficiarios</h2>
          <p>Administra las personas a las que puedes realizar transferencias.</p>
        </div>

        <span className="beneficiaries-count">
          {beneficiaries.length} registrados
        </span>
      </div>

      <div className="beneficiaries-content">
        <section className="beneficiary-form-card">
          <h3>Agregar beneficiario</h3>
          <p>Ingresa los datos de la cuenta de destino.</p>

          <form onSubmit={handleCreate}>
            <div className="beneficiary-form-group">
              <label htmlFor="beneficiary-name">Nombre completo</label>
              <input
                id="beneficiary-name"
                type="text"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                maxLength={150}
                required
              />
            </div>

            <div className="beneficiary-form-group">
              <label htmlFor="beneficiary-alias">Alias</label>
              <input
                id="beneficiary-alias"
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="Ej. Cuenta de Juan"
                maxLength={100}
                required
              />
            </div>

            <div className="beneficiary-form-group">
              <label htmlFor="beneficiary-clabe">CLABE interbancaria</label>
              <input
                id="beneficiary-clabe"
                type="text"
                inputMode="numeric"
                value={clabe}
                onChange={(e) =>
                  setClabe(e.target.value.replace(/\D/g, "").slice(0, 18))
                }
                placeholder="18 dígitos"
                maxLength={18}
                required
              />
              <small>{clabe.length}/18 dígitos</small>
            </div>

            {error && (
              <p className="beneficiary-message error" role="alert">
                {error}
              </p>
            )}

            {success && (
              <p className="beneficiary-message success" role="status">
                {success}
              </p>
            )}

            <button
              type="submit"
              className="beneficiary-submit"
              disabled={saving}
            >
              {saving ? "Guardando..." : "+ Agregar beneficiario"}
            </button>
          </form>
        </section>

        <section className="beneficiary-list-section">
          <h3>Beneficiarios registrados</h3>

          {loading ? (
            <p className="beneficiary-state">Cargando beneficiarios...</p>
          ) : error && beneficiaries.length === 0 ? (
            <p className="beneficiary-state error">{error}</p>
          ) : beneficiaries.length === 0 ? (
            <div className="beneficiary-empty">
              <span>♧</span>
              <h3>Aún no tienes beneficiarios</h3>
              <p>Agrega tu primer beneficiario utilizando el formulario.</p>
            </div>
          ) : (
            <div className="beneficiaries-grid">
              {beneficiaries.map((beneficiary) => (
                <article
                  className="beneficiary-card"
                  key={beneficiary.id}
                >
                  <div className="beneficiary-card-header">
                    <div className="beneficiary-avatar">
                      {beneficiary.beneficiary_name.charAt(0).toUpperCase()}
                    </div>

                    <div className="beneficiary-card-title">
                      <strong>{beneficiary.beneficiary_name}</strong>
                      <span>{beneficiary.alias}</span>
                    </div>
                  </div>

                  <div className="beneficiary-card-details">
                    <span>CLABE interbancaria</span>
                    <strong>{beneficiary.clabe}</strong>
                  </div>

                  <button
                    type="button"
                    className="beneficiary-delete"
                    onClick={() => handleDelete(beneficiary.id)}
                    disabled={deletingId === beneficiary.id}
                  >
                    {deletingId === beneficiary.id
                      ? "Eliminando..."
                      : "Eliminar beneficiario"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Beneficiaries;
