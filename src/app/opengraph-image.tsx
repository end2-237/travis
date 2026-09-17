import { ImageResponse } from "next/og";

/**
 * Image de partage.
 *
 * Travis circule d'abord par WhatsApp, entre candidats. Sans cette image, un
 * lien collé dans une conversation n'affiche qu'une URL nue : rien n'invite
 * à l'ouvrir, et le canal d'acquisition principal du produit ne dit pas ce
 * qu'il propose.
 *
 * Elle est composée ici plutôt que dessinée dans un fichier : les chiffres
 * viennent du catalogue et restent donc exacts quand il évolue.
 */
export const alt = "Travis — trouvez votre bourse, bâtissez votre avenir";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const { CATALOG } = await import("@/data/catalog");
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");

  const logo = `data:image/png;base64,${(
    await readFile(
      join(process.cwd(), "public", "brand", "travis-logo-blanc.png"),
    )
  ).toString("base64")}`;
  const total = CATALOG.length;
  const integrales = CATALOG.filter((e) => e.fully_funded).length;
  const pays = new Set(CATALOG.map((e) => e.country)).size;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#101010",
          backgroundImage:
            "radial-gradient(900px 600px at 18% 22%, rgba(185,229,109,0.30), transparent 70%), radial-gradient(800px 560px at 84% 74%, rgba(31,111,235,0.34), transparent 70%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Satori ne va pas chercher d'image sur le réseau : le fichier est
              lu sur le disque et inséré en base64. */}
          <img src={logo} alt="" height={54} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Satori exige un `display` explicite dès qu'un bloc a plusieurs
              enfants : les deux lignes sont donc deux éléments, sans <br>. */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              maxWidth: 900,
            }}
          >
            <div>Trouvez votre bourse,</div>
            <div>bâtissez votre avenir</div>
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 27,
              color: "rgba(255,255,255,0.72)",
              maxWidth: 820,
            }}
          >
            Évaluation gratuite · Feuille de route à 500 FCFA
          </div>
        </div>

        <div style={{ display: "flex", gap: 56 }}>
          {[
            [String(total), "programmes"],
            [String(integrales), "bourses à 100 %"],
            [String(pays), "destinations"],
          ].map(([valeur, libelle]) => (
            <div key={libelle} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: "-0.04em" }}>
                {valeur}
              </div>
              <div style={{ fontSize: 21, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
                {libelle}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
