import "server-only";
import { randomUUID } from "node:crypto";
import type { MatchSnapshot, Order, StudentProfile } from "@/types/database";

/**
 * Stockage volatil du mode démonstration (Supabase absent).
 * Process unique, non persistant : ne sert jamais en production, où les
 * profils et commandes vivent dans PostgreSQL.
 */
type Entry = { profile: StudentProfile; snapshot: MatchSnapshot };

// Next.js isole le registre de modules de chaque route : un Map au niveau
// module ne serait pas partagé entre une Server Action et une route API.
// globalThis garantit une instance unique par processus.
const store = globalThis as typeof globalThis & {
  __travisDemoProfiles?: Map<string, Entry>;
  __travisDemoOrders?: Map<string, Order>;
};

const profiles = (store.__travisDemoProfiles ??= new Map<string, Entry>());
const orders = (store.__travisDemoOrders ??= new Map<string, Order>());

export function rememberSession(entry: Entry): string {
  const id = randomUUID();
  profiles.set(id, { ...entry, profile: { ...entry.profile, id } });
  return id;
}

export function readSession(id: string): Entry | null {
  return profiles.get(id) ?? null;
}

export function rememberOrder(order: Order): Order {
  orders.set(order.id, order);
  return order;
}

export function readOrder(id: string): Order | null {
  return orders.get(id) ?? null;
}

export function findOrderByRef(ref: string): Order | null {
  for (const order of orders.values()) {
    if (order.transaction_ref === ref) return order;
  }
  return null;
}

export function updateOrder(id: string, patch: Partial<Order>): Order | null {
  const existing = orders.get(id);
  if (!existing) return null;
  const next = { ...existing, ...patch };
  orders.set(id, next);
  return next;
}
