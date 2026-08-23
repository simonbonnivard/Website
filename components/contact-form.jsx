"use client";

import { useId, useRef, useState } from "react";

const VEHICLE_OPTIONS = [
  { value: "voiture", label: "Voiture" },
  { value: "utilitaire", label: "Utilitaire ou poids lourd" },
  { value: "moto", label: "Moto ou scooter" },
  { value: "camping-car", label: "Camping-car ou van" },
  { value: "bateau", label: "Bateau" },
  { value: "golfette", label: "Golfette" },
  { value: "pmr", label: "Fauteuil roulant ou scooter de mobilité" },
  { value: "autre", label: "Autre équipement" },
];

const NEED_OPTIONS = [
  { value: "diagnostic", label: "Diagnostic" },
  { value: "remplacement", label: "Remplacement de batterie" },
  { value: "domicile", label: "Intervention à domicile" },
  { value: "energie-embarquee", label: "Conseil énergie embarquée" },
  { value: "pmr", label: "Mobilité et PMR" },
  { value: "entretien", label: "Entretien courant" },
  { value: "autre", label: "Autre" },
];

const INITIAL_VALUES = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  vehicleType: "",
  need: "",
  message: "",
  website: "",
  consent: false,
};

export default function ContactForm() {
  const formId = useId();
  const mountedAt = useRef(Date.now());
  const [values, setValues] = useState(INITIAL_VALUES);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!values.consent) {
      setStatus("error");
      setErrorMessage("Merci d'accepter l'utilisation de vos informations.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          vehicleType: values.vehicleType,
          need: values.need,
          message: values.message,
          website: values.website,
          startedAt: mountedAt.current,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Une erreur est survenue.");
      }

      setStatus("success");
      setValues(INITIAL_VALUES);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue, merci de réessayer."
      );
    }
  }

  if (status === "success") {
    return (
      <div className="form-status form-status--success" role="status">
        <p className="form-status__title">Merci, votre demande a bien été envoyée.</p>
        <p className="form-status__text">
          On vous recontacte au plus vite pour vous conseiller.
        </p>
      </div>
    );
  }

  return (
    <form className="contact-form__grid" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor={`${formId}-firstName`}>Prénom</label>
        <input
          id={`${formId}-firstName`}
          name="firstName"
          type="text"
          autoComplete="given-name"
          required
          value={values.firstName}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label htmlFor={`${formId}-lastName`}>Nom</label>
        <input
          id={`${formId}-lastName`}
          name="lastName"
          type="text"
          autoComplete="family-name"
          required
          value={values.lastName}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label htmlFor={`${formId}-email`}>Email</label>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label htmlFor={`${formId}-phone`}>Téléphone</label>
        <input
          id={`${formId}-phone`}
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          value={values.phone}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label htmlFor={`${formId}-vehicleType`}>Type de véhicule</label>
        <select
          id={`${formId}-vehicleType`}
          name="vehicleType"
          required
          value={values.vehicleType}
          onChange={handleChange}
        >
          <option value="" disabled>
            Sélectionnez votre véhicule
          </option>
          {VEHICLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor={`${formId}-need`}>Votre besoin</label>
        <select
          id={`${formId}-need`}
          name="need"
          required
          value={values.need}
          onChange={handleChange}
        >
          <option value="" disabled>
            Sélectionnez votre besoin
          </option>
          {NEED_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field form-field--full">
        <label htmlFor={`${formId}-message`}>Votre message</label>
        <textarea
          id={`${formId}-message`}
          name="message"
          rows={4}
          placeholder="Modèle du véhicule, problème rencontré…"
          value={values.message}
          onChange={handleChange}
        />
      </div>

      <div className="hp-field" aria-hidden="true">
        <label htmlFor={`${formId}-website`}>Votre site web</label>
        <input
          id={`${formId}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={handleChange}
        />
      </div>

      <div className="form-field form-field--full form-field--consent">
        <label className="form-consent">
          <input
            type="checkbox"
            name="consent"
            required
            checked={values.consent}
            onChange={handleChange}
          />
          <span>
            J&apos;accepte que mes informations soient utilisées pour traiter ma
            demande, conformément à la{" "}
            <a href="/politique-de-confidentialite/">politique de confidentialité</a>.
          </span>
        </label>
      </div>

      {status === "error" && (
        <div className="form-status form-status--error" role="alert">
          <p className="form-status__text">{errorMessage}</p>
        </div>
      )}

      <div className="form-field form-field--full contact-form__submit">
        <button
          type="submit"
          className="pill pill--primary"
          disabled={status === "submitting"}
        >
          <span className="pill__label">
            {status === "submitting" ? "Envoi…" : "Envoyer ma demande"}
          </span>
        </button>
      </div>
    </form>
  );
}
