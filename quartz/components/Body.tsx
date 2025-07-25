// @ts-ignore
import clipboardScript from "./scripts/clipboard.inline"
import clipboardStyle from "./styles/clipboard.scss"
// @ts-ignore
import canvasScript from "./scripts/canvas.inline"
import canvasStyle from "./styles/canvasViewer.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Body: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return <div id="quartz-body">{children}</div>
}

Body.afterDOMLoaded = clipboardScript + "\n" + canvasScript
Body.css = clipboardStyle + "\n" + canvasStyle

export default (() => Body) satisfies QuartzComponentConstructor
