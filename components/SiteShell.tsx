import type { Settings } from "@/lib/types";
import { BagProvider } from "./Bag";
import { Footer } from "./Footer";
import { Motion, motionBootScript } from "./Motion";
import { Nav } from "./Nav";

export function SiteShell({
  settings,
  solidNav,
  children,
}: {
  settings: Settings;
  solidNav?: boolean;
  children: React.ReactNode;
}) {
  return (
    <BagProvider settings={settings}>
      <script dangerouslySetInnerHTML={{ __html: motionBootScript }} />
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      {settings.announcement ? <p className="announcement">{settings.announcement}</p> : null}
      <Nav solid={solidNav} storeName={settings.storeName} />
      <main id="contenido">{children}</main>
      <Footer settings={settings} />
      <Motion />
    </BagProvider>
  );
}
