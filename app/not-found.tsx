import Link from "next/link";
import { Mark } from "@/components/Art";

export default function NotFound() {
  return (
    <main className="lost">
      <Mark size={120} />
      <h1 className="h2">Esta página
        <br />
        se quedó dormida</h1>
      <p>No encontramos lo que buscabas. Quizás ya no está en el catálogo.</p>
      <Link className="btn btn--gold" href="/#catalogo">
        Volver al catálogo
      </Link>
    </main>
  );
}
