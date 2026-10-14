import type { Settings } from "@/lib/types";
import { BagProvider } from "./Bag";
import { Footer } from "./Footer";
import { Motion, motionBootScript } from "./Motion";
import { sectionLinks } from "@/lib/defaults";
import { MusicPlayer } from "./MusicPlayer";
import { Nav } from "./Nav";
import { DaySky } from "./DaySky";
import { StarField } from "./StarField";

/**
 * Se ejecuta antes de pintar: decide día o noche (lo que eligió el visitante,
 * o el modo por defecto de la tienda) y permite previsualizar con
 * /?tema=lavanda&modo=oscuro sin publicar nada.
 */
function bootScript(defaultMode: string, allowToggle: boolean) {
  return `(function(){try{var el=document.currentScript.parentElement;var q=new URLSearchParams(location.search);
var p=q.get('tema');if(p&&/^(luna|lavanda|durazno)$/.test(p))el.setAttribute('data-paleta',p);
var m=q.get('modo');var saved=null;${allowToggle ? "try{saved=localStorage.getItem('onistore-modo')}catch(e){}" : ""}
var d=${JSON.stringify(defaultMode)};var mode=(m==='claro'||m==='oscuro')?m:(saved==='claro'||saved==='oscuro')?saved:d==='auto'?(matchMedia('(prefers-color-scheme: dark)').matches?'oscuro':'claro'):d;
el.setAttribute('data-modo',mode);}catch(e){}})();`;
}

export function SiteShell({ settings, children }: { settings: Settings; solidNav?: boolean; children: React.ReactNode }) {
  const a = settings.appearance;
  return (
    <div
      className="site"
      data-paleta={a.palette}
      data-modo={a.mode === "oscuro" ? "oscuro" : "claro"}
      data-estrellas={a.stars}
      suppressHydrationWarning
    >
      <script dangerouslySetInnerHTML={{ __html: bootScript(a.mode, a.modeToggle) }} />
      {a.daySky ? <DaySky /> : null}
      {a.stars ? <StarField /> : null}
      <BagProvider settings={settings}>
        <script dangerouslySetInnerHTML={{ __html: motionBootScript }} />
        <a className="skip" href="#contenido">
          Saltar al contenido
        </a>
        {settings.announcement ? <p className="announcement">{settings.announcement}</p> : null}
        <Nav storeName={settings.storeName} logo={a.logo} modeToggle={a.modeToggle} links={sectionLinks(settings.home)} />
        <main id="contenido">{children}</main>
        <Footer settings={settings} />
        {a.music ? <MusicPlayer autoplay={a.musicAutoplay} /> : null}
        <Motion />
      </BagProvider>
    </div>
  );
}
