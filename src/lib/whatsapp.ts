import "server-only";
import { envOrNull } from "@/lib/site";

/**
 * Livraison WhatsApp du lien de téléchargement (SRS §4, jour 7 — optionnel).
 * Sans configuration Cloud API, la fonction ne fait rien : l'absence de
 * notification ne doit jamais faire échouer un paiement déjà encaissé.
 */
export async function notifyReportReady(
  phoneNumber: string,
  fullName: string | null,
  orderId: string,
): Promise<boolean> {
  const token = envOrNull("WHATSAPP_TOKEN");
  const phoneId = envOrNull("WHATSAPP_PHONE_NUMBER_ID");
  const siteUrl = envOrNull("NEXT_PUBLIC_SITE_URL");

  if (!token || !phoneId || !siteUrl) return false;

  const to = phoneNumber.replace(/[^\d]/g, "");
  const link = `${siteUrl.replace(/\/$/, "")}/telechargement/${orderId}`;
  const greeting = fullName ? `Bonjour ${fullName.split(" ")[0]}` : "Bonjour";

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: {
            preview_url: true,
            body: `${greeting}, votre feuille de route Travis est prête. Téléchargez-la ici : ${link}`,
          },
        }),
      },
    );

    if (!response.ok) {
      console.warn("[whatsapp] envoi refusé", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[whatsapp] envoi impossible", error);
    return false;
  }
}
