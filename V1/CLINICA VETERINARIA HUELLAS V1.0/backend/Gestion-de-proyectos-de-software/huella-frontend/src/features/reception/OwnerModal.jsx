import { useEffect, useState } from "react";
import { CalendarCheck, ChevronDown } from "lucide-react";
import Modal from "../../components/ui/Modal.jsx";
import FormField from "../../components/ui/FormField.jsx";
import { digitsOnly } from "../../Utils/text.js";

const EMPTY = {
  fullName: "", phone: "", email: "", password: "",
  petName: "", petType: "", sex: "", breed: "", ageYears: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(f) {
  const e = {};
  if (f.fullName.trim().split(/\s+/).filter(Boolean).length < 2) e.fullName = "Escribe nombre y apellido";
  if (!/^3\d{9}$/.test(digitsOnly(f.phone))) e.phone = "Celular de 10 dígitos (ej. 300 000 0000)";
  if (!EMAIL_RE.test(f.email.trim())) e.email = "Correo no válido";
  if (f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) {
    e.password = "Mínimo 8 caracteres, con letras y números";
  }
  if (f.petName.trim().length < 2) e.petName = "Escribe el nombre de la mascota";
  if (!f.petType) e.petType = "Selecciona el tipo";
  if (!f.sex) e.sex = "Selecciona el género";
  const age = Number(f.ageYears);
  if (f.ageYears === "" || !Number.isInteger(age) || age < 0 || age > 40) e.ageYears = "Edad entre 0 y 40";
  return e;
}

export default function OwnerModal({ open, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setErrors({});
    }
  }, [open]);

  const bind = (field) => ({
    value: form[field],
    onChange: (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((er) => ({ ...er, [field]: undefined }));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = validate(form);
    if (Object.keys(next).length) return setErrors(next);

    const result = onSave({
      fullName: form.fullName.trim(),
      phone: digitsOnly(form.phone),
      email: form.email.trim(),
      password: form.password,
      petName: form.petName.trim(),
      petType: form.petType,
      sex: form.sex,
      breed: form.breed.trim(),
      ageYears: Number(form.ageYears),
    });
    if (!result.ok) setErrors({ [result.field ?? "form"]: result.error });
  };

  const ph = (value) => (value === "" ? "is-placeholder" : "");

  return (
    <Modal open={open} onClose={onClose} labelledBy="owner-title">
      <span className="modal__icon">
        <CalendarCheck size={22} strokeWidth={1.7} />
      </span>
      <h2 className="modal__title" id="owner-title">Registrar nuevo usuario</h2>
      <p className="modal__subtitle">Completa la información para guardar el registro en Huella.</p>

      <form onSubmit={handleSubmit} noValidate>
        <p className="form-section">Datos del usuario</p>

        <FormField id="own-name" label="Nombre del usuario" error={errors.fullName}>
          <input
            id="own-name"
            className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
            placeholder="Nombre completo del propietario"
            autoComplete="off"
            data-autofocus
            {...bind("fullName")}
          />
        </FormField>

        <div className="form-row">
          <FormField id="own-phone" label="Número de contacto" error={errors.phone}>
            <input
              id="own-phone"
              inputMode="tel"
              className={`form-control ${errors.phone ? "is-invalid" : ""}`}
              placeholder="300 000 0000"
              {...bind("phone")}
            />
          </FormField>
          <FormField id="own-email" label="Correo" error={errors.email}>
            <input
              id="own-email"
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              placeholder="correo@ejemplo.com"
              {...bind("email")}
            />
          </FormField>
        </div>

        <FormField id="own-pass" label="Contraseña nueva" error={errors.password}>
          <input
            id="own-pass"
            type="password"
            autoComplete="new-password"
            className={`form-control ${errors.password ? "is-invalid" : ""}`}
            placeholder="Mínimo 8 caracteres"
            {...bind("password")}
          />
        </FormField>

        <p className="form-section form-section--spaced">Datos de la mascota</p>

        <FormField id="own-pet" label="Nombre de la mascota" error={errors.petName}>
          <input
            id="own-pet"
            className={`form-control ${errors.petName ? "is-invalid" : ""}`}
            placeholder="Ej. Max"
            autoComplete="off"
            {...bind("petName")}
          />
        </FormField>

        <div className="form-row">
          <FormField id="own-type" label="Tipo de mascota" error={errors.petType}>
            <div className="select">
              <select
                id="own-type"
                className={`form-control ${ph(form.petType)} ${errors.petType ? "is-invalid" : ""}`}
                {...bind("petType")}
              >
                <option value="" disabled>Perro, gato, etc.</option>
                <option>Perro</option>
                <option>Gato</option>
                <option>Conejo</option>
                <option>Ave</option>
                <option>Otro</option>
              </select>
              <ChevronDown size={16} />
            </div>
          </FormField>
          <FormField id="own-sex" label="Género" error={errors.sex}>
            <div className="select">
              <select
                id="own-sex"
                className={`form-control ${ph(form.sex)} ${errors.sex ? "is-invalid" : ""}`}
                {...bind("sex")}
              >
                <option value="" disabled>Seleccionar</option>
                <option value="M">Macho</option>
                <option value="F">Hembra</option>
              </select>
              <ChevronDown size={16} />
            </div>
          </FormField>
        </div>

        <div className="form-row">
          <FormField id="own-breed" label="Raza" error={errors.breed}>
            <input
              id="own-breed"
              className="form-control"
              placeholder="Raza de la mascota"
              {...bind("breed")}
            />
          </FormField>
          <FormField id="own-age" label="Edad de la mascota" error={errors.ageYears}>
            <input
              id="own-age"
              type="number"
              min={0}
              max={40}
              step={1}
              inputMode="numeric"
              className={`form-control ${errors.ageYears ? "is-invalid" : ""}`}
              placeholder="Edad en años"
              {...bind("ageYears")}
            />
          </FormField>
        </div>

        {errors.form && <p className="form-banner" role="alert">{errors.form}</p>}

        <button type="submit" className="modal__submit">Guardar registro</button>
      </form>
    </Modal>
  );
}