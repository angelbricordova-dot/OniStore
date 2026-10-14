import type { Settings } from "@/lib/types";
import { BagProvider } from "./Bag";
import { Footer } from "./Footer";
import { Motion, motionBootScript } from "./Motion";
import { Nav } from "./Nav";

/** Permite ver otra paleta sin publicarla: /?tema=noche */
const themePreviewScript = `
(function(){try{var t=new URLSearchParams(location.search).get('tema');
if(t&&/^(luna|lavanda|durazno|noche)$/.test(t)){document.currentScript.parentElement.setAttribute('data-tema',t);}}catch(e){}})();
`;

export function SiteShell({
  settings,
  children,
}: {
  settings: Settings;
  solidNav?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="site" data-tema={settings.theme} suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: themePreviewScript }} />
      <BagProvider settings={settings}>
        <script dangerouslySetInnerHTML={{ __html: motionBootScript }} />
        <a className="skip" href="#contenido">
          Saltar al contenido
        </a>
        {settings.announcement ? <p className="announcement">{settings.announcement}</p> : null}
        <Nav storeName={settings.storeName} />
        <main id="contenido">{children}</main>
        <Footer settings={settings} />
        <Motion />
      </BagProvider>
    </div>
  );
}
