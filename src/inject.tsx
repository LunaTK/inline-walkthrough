import { render } from "preact";
import { ChatPanel } from "./components/chat/Chat";
import styles from "./styles.css?inline";

const script = document.currentScript as HTMLScriptElement | null;
const api =
  script?.dataset.api ?? import.meta.env.VITE_CHAT_API_URL ?? "http://127.0.0.1:3001/api/chat";
if (!document.getElementById("inline-chat-root")) {
  const host = document.createElement("div");
  host.id = "inline-chat-root";
  host.style.cssText =
    "all:initial!important;position:fixed!important;inset:0!important;pointer-events:none!important;z-index:2147483647!important;";
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = styles;
  shadow.append(style);
  const root = document.createElement("div");
  shadow.append(root);
  // Keyboard, composition, and clipboard events cross the shadow boundary and
  // bubble to the page. Stop them at the host so page listeners cannot
  // intercept typing. Bubble phase only: capture would run before the
  // textarea and block input from reaching it.
  for (const type of [
    "keydown",
    "keypress",
    "keyup",
    "beforeinput",
    "input",
    "compositionstart",
    "compositionupdate",
    "compositionend",
    "paste",
    "cut",
    "copy",
  ]) {
    host.addEventListener(type, (event) => event.stopPropagation());
  }
  document.documentElement.append(host);
  render(<ChatPanel api={api} />, root);
}
