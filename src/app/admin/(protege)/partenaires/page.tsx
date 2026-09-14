import { AdminShell } from "@/components/admin/shell";
import { PartnerManager } from "@/components/admin/partner-manager";
import { getPartners } from "@/lib/admin/queries";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminPartnersPage() {
  const partners = await getPartners();

  return (
    <AdminShell
      title="Partenaires"
      lede="Les services proposés aux candidats pour constituer leur dossier d'immigration."
      demo={!isSupabaseConfigured()}
    >
      <PartnerManager partners={partners} />
    </AdminShell>
  );
}
