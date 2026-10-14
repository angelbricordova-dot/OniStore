import Link from "next/link";
import { Mark } from "@/components/Art";

export default function NotFound() {
  return (
    <main className="lost">
      <Mark size={88} />
      <h1 className="title">Esta página se quedó dormida.</h1>
      <p>No encontramos lo que buscabas. Quizás ya no está en la colección.</p>
      <Link className="btn btn--primary" href="/#coleccion">
        Volver a la colección
      </Link>
    </main>
  );
}
