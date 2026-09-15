import { cn } from "@/lib/utils";

/**
 * Surface texturée.
 *
 * Le grain casse l'aplat numérique des grands fonds unis : l'œil y lit une
 * matière plutôt qu'une surface morte. Coût réel : une turbulence SVG inline,
 * mise en cache une fois pour toute la page.
 */
export function Grain({
  children,
  className,
  soft = false,
  as: Tag = "div",
}: {
  children?: React.ReactNode;
  className?: string;
  soft?: boolean;
  as?: React.ElementType;
}) {
  return (
    <Tag
      className={cn("grain relative", soft && "grain-soft", className)}
    >
      {children}
    </Tag>
  );
}
