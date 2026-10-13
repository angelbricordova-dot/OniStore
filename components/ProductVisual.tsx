import Image from "next/image";
import type { Product } from "@/lib/types";
import { ProductArt } from "./Art";

/** Foto del producto si existe; si no, su dibujo en el color elegido. */
export function ProductVisual({
  product,
  colorHex,
  index = 0,
  sizes = "(max-width: 760px) 100vw, 50vw",
  priority,
  className,
}: {
  product: Product;
  colorHex?: string;
  index?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const src = product.images[index];
  if (src) {
    return (
      <Image
        src={src}
        alt={product.name}
        fill
        sizes={sizes}
        priority={priority}
        className={className ? `${className} visual-photo` : "visual-photo"}
      />
    );
  }
  return (
    <ProductArt
      kind={product.art}
      color={colorHex ?? product.colors[0]?.hex}
      className={className ? `${className} visual-art` : "visual-art"}
      label={`Dibujo de ${product.name}`}
    />
  );
}
