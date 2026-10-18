import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressForm, ContactForm } from "@/src/components/siae/ProfileForms";

describe("formularios de perfil", () => {
  it("valida el teléfono internacional y muestra el error asociado", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ContactForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/nombre/i), "Ana");
    await user.type(screen.getByLabelText(/teléfono/i), "123");
    await user.type(screen.getByLabelText(/vínculo|relación/i), "Hija");
    await user.click(screen.getByRole("button", { name: /guardar/i }));

    expect(await screen.findByRole("alert")).toHaveAttribute("id", "contact-phone-error");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("envía una dirección válida con punto de referencia y coordenadas", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AddressForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/nombre/i), "Casa");
    await user.type(screen.getByLabelText(/sector/i), "Av. Bolívar c/c Calle Monagas, Maturín, Edo. Monagas");
    await user.type(screen.getByLabelText(/punto de referencia/i), "Frente a la plaza, portón blanco");
    await user.selectOptions(screen.getByLabelText(/parroquia/i), "San Simón");
    fireEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          label: "Casa",
          value: "Av. Bolívar c/c Calle Monagas, Maturín, Edo. Monagas",
          referencePoint: "Frente a la plaza, portón blanco",
        }),
        expect.anything()
      );
    });
  });
});
