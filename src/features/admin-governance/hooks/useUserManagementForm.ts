import { useState, useCallback } from "react";
import { SystemUserRole, ManagedUser } from "@/src/modules/admin/users-store";

export interface UseUserManagementFormProps {
  updateUser: (id: string, data: any) => Promise<{ success: boolean; error?: string }>;
  addUser: (data: any) => Promise<{ success: boolean; error?: string }>;
}

export function useUserManagementForm({ updateUser, addUser }: UseUserManagementFormProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newRole, setNewRole] = useState<SystemUserRole>("operador");
  const [newPhone, setNewPhone] = useState("");
  const [newOrganismo, setNewOrganismo] = useState("VEN 911 Monagas (Comando Central Maturín)");
  const [newPlaca, setNewPlaca] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = useCallback(() => {
    setEditingUser(null);
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setNewRole("operador");
    setNewPhone("");
    setNewOrganismo("VEN 911 Monagas (Comando Central Maturín)");
    setNewPlaca("");
    setFormError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowCreateModal(true);
  }, []);

  const openEditModal = useCallback((user: ManagedUser) => {
    setEditingUser(user);
    setNewName(user.nombre_completo);
    setNewEmail(user.correo_electronico);
    setNewRole(user.role);
    setNewPhone(user.telefono || "");
    setNewPassword("");
    setNewPlaca("");
    setFormError(null);
    setShowPassword(false);
    setShowCreateModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowCreateModal(false);
    setEditingUser(null);
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setNewPhone("");
    setNewPlaca("");
    setNewRole("operador");
    setFormError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  const handleCreateUser = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);

      if (!newName.trim()) {
        setFormError("El nombre completo es requerido");
        return;
      }
      if (!newEmail.trim() || !newEmail.includes("@")) {
        setFormError("Ingrese un correo electrónico institucional válido");
        return;
      }
      if (!editingUser) {
        if (!newPassword || newPassword.length < 6) {
          setFormError("La contraseña debe tener al menos 6 caracteres");
          return;
        }
        if (!confirmPassword) {
          setFormError("Debe confirmar la contraseña ingresándola nuevamente");
          return;
        }
        if (newPassword !== confirmPassword) {
          setFormError("Las contraseñas no coinciden. Verifique ambos campos");
          return;
        }
      }

      setSubmitting(true);

      const displayName = editingUser
        ? newName.trim()
        : `${newName.trim()}${newPlaca.trim() ? ` (${newPlaca.trim()})` : ""}`;

      if (editingUser) {
        const result = await updateUser(editingUser.id, {
          nombre_completo: displayName,
          correo_electronico: newEmail.trim(),
        });
        setSubmitting(false);
        if (result.success) {
          closeModal();
        } else {
          setFormError(result.error || "No se pudo actualizar el usuario");
        }
      } else {
        const result = await addUser({
          nombre_completo: displayName,
          correo_electronico: newEmail.trim(),
          password: newPassword,
          role: newRole,
          telefono: newPhone.trim() || undefined,
        });
        setSubmitting(false);
        if (result.success) {
          closeModal();
        } else {
          setFormError(result.error || "No se pudo registrar el usuario");
        }
      }
    },
    [newName, newEmail, newPassword, confirmPassword, newRole, newPhone, newPlaca, editingUser, updateUser, addUser, closeModal]
  );

  return {
    showCreateModal,
    setShowCreateModal,
    editingUser,
    submitting,
    showPassword,
    setShowPassword,
    confirmPassword,
    setConfirmPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    newName,
    setNewName,
    newEmail,
    setNewEmail,
    newPassword,
    setNewPassword,
    newRole,
    setNewRole,
    newPhone,
    setNewPhone,
    newOrganismo,
    setNewOrganismo,
    newPlaca,
    setNewPlaca,
    formError,
    openCreateModal,
    openEditModal,
    closeModal,
    handleCreateUser,
  };
}
