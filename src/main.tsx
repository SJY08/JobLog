import "./app/styles/global.css"
import ReactDOM from "react-dom/client"
import { App } from "./app/App"

/**
 * @description 앱 진입점
 */
const rootEl = document.getElementById("root")
if (rootEl) {
    ReactDOM.createRoot(rootEl).render(<App />)
}
