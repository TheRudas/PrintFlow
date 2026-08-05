"use server";

import { redirect } from "next/navigation";
import { crearClienteServidor } from "../supabase/server";
import { crearClienteAdmin } from "../supabase/admin";
import { obtenerPerfilPorUsuarioId, asignarRol } from "./perfiles";
import type { Perfil } from "../types";

export async function iniciarSesion(
  correo: string,
  contrasena: string
): Promise<{ exito: boolean; error?: string }> {
  const supabase = await crearClienteServidor();

  const { error } = await supabase.auth.signInWithPassword({
    email: correo.trim(),
    password: contrasena,
  });

  if (error) {
    return { exito: false, error: "Correo o contraseña incorrectos" };
  }

  return { exito: true };
}

export async function cerrarSesion(): Promise<void> {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
}

export async function obtenerUsuarioActual(): Promise<{
  usuarioId: string | null;
  correo: string | null;
  perfil: Perfil | null;
}> {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { usuarioId: null, correo: null, perfil: null };
  }

  let perfil: Perfil | null = null;
  try {
    perfil = await obtenerPerfilPorUsuarioId(user.id);
  } catch {
    perfil = null;
  }

  return {
    usuarioId: user.id,
    correo: user.email ?? null,
    perfil,
  };
}

export async function esAdmin(): Promise<boolean> {
  const { usuarioId, perfil } = await obtenerUsuarioActual();
  return usuarioId !== null && perfil?.rol === "admin";
}

export async function irAlIngreso(): Promise<void> {
  redirect("/ingresar");
}

export async function crearCuentaEmpleado(
  correo: string,
  contrasena: string,
  nombre: string
): Promise<{ exito: boolean; error?: string }> {
  const sesionAdmin = await esAdmin();
  if (!sesionAdmin) {
    return { exito: false, error: "No autorizado" };
  }

  const supabaseAdmin = crearClienteAdmin();

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: correo.trim(),
    password: contrasena,
    email_confirm: true,
  });

  if (error) {
    return {
      exito: false,
      error:
        error.message === "User already registered"
          ? "Ya existe una cuenta con ese correo"
          : error.message,
    };
  }

  const perfil = await obtenerPerfilPorUsuarioId(data.user.id);
  if (!perfil) {
    await asignarRol(data.user.id, nombre.trim(), "empleado");
  }

  return { exito: true };
}

export async function cambiarContrasena(
  usuarioId: string,
  nuevaContrasena: string
): Promise<{ exito: boolean; error?: string }> {
  const sesionAdmin = await esAdmin();
  if (!sesionAdmin) {
    return { exito: false, error: "No autorizado" };
  }

  const supabaseAdmin = crearClienteAdmin();

  const { error } = await supabaseAdmin.auth.admin.updateUserById(usuarioId, {
    password: nuevaContrasena,
  });

  if (error) {
    return { exito: false, error: error.message };
  }

  return { exito: true };
}

export async function listarPerfiles(): Promise<Perfil[]> {
  const sesionAdmin = await esAdmin();
  if (!sesionAdmin) {
    return [];
  }

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .order("creado_en");

  if (error) {
    return [];
  }

  return data ?? [];
}
