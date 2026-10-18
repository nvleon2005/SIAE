import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Escribe un nombre para la dirección (ej. Casa)."),
  value: z.string().trim().min(3, "Escribe una dirección o sector."),
  referencePoint: z.string().trim().min(3, "Ingresa un punto de referencia cercano."),
  parroquia: z.string().trim().min(1, "Selecciona una parroquia."),
  lat: z.number({ message: "Debe fijar la ubicación en el mapa" }),
  lng: z.number({ message: "Debe fijar la ubicación en el mapa" }),
  accuracy: z.number().optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Escribe el nombre del contacto."),
  phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/, "Ingresa un teléfono válido, ej. 04141234567 o +584141234567"),
  relation: z.string().trim().min(1, "Escribe la relación con el contacto."),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
export type ContactFormValues = z.infer<typeof contactSchema>;
