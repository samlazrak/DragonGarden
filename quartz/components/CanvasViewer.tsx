import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { JSX } from "preact"
import style from "./styles/canvasViewer.scss"
import script from "./scripts/canvas.inline"

interface CanvasNode {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  text?: string
  file?: string
  color?: string
}

interface CanvasEdge {
  id: string
  fromNode: string
  toNode: string
  fromSide?: string
  toSide?: string
  color?: string
  label?: string
}

interface CanvasData {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

interface CanvasViewerProps {
  canvasData: CanvasData
  title?: string
  className?: string
}

const CanvasViewer: QuartzComponent = ({ canvasData, title, className }: CanvasViewerProps) => {
  if (!canvasData || !canvasData.nodes) {
    return null
  }

  // Calculate canvas bounds
  const bounds = canvasData.nodes.reduce(
    (acc, node) => ({
      minX: Math.min(acc.minX, node.x),
      maxX: Math.max(acc.maxX, node.x + node.width),
      minY: Math.min(acc.minY, node.y),
      maxY: Math.max(acc.maxY, node.y + node.height),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  )

  const padding = 50
  const viewWidth = bounds.maxX - bounds.minX + 2 * padding
  const viewHeight = bounds.maxY - bounds.minY + 2 * padding
  const viewBox = `${bounds.minX - padding} ${bounds.minY - padding} ${viewWidth} ${viewHeight}`

  // Create path for an edge
  const createEdgePath = (edge: CanvasEdge) => {
    const fromNode = canvasData.nodes.find(n => n.id === edge.fromNode)
    const toNode = canvasData.nodes.find(n => n.id === edge.toNode)
    
    if (!fromNode || !toNode) return ""

    // Calculate connection points based on sides
    const getConnectionPoint = (node: CanvasNode, side?: string) => {
      const centerX = node.x + node.width / 2
      const centerY = node.y + node.height / 2
      
      switch (side) {
        case "top": return { x: centerX, y: node.y }
        case "bottom": return { x: centerX, y: node.y + node.height }
        case "left": return { x: node.x, y: centerY }
        case "right": return { x: node.x + node.width, y: centerY }
        default: return { x: centerX, y: centerY }
      }
    }

    const fromPoint = getConnectionPoint(fromNode, edge.fromSide)
    const toPoint = getConnectionPoint(toNode, edge.toSide)

    // Create a smooth curve
    const dx = toPoint.x - fromPoint.x
    const dy = toPoint.y - fromPoint.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const controlOffset = Math.min(distance * 0.3, 100)

    let controlX1 = fromPoint.x
    let controlY1 = fromPoint.y
    let controlX2 = toPoint.x
    let controlY2 = toPoint.y

    // Adjust control points based on connection sides
    if (edge.fromSide === "top" || edge.fromSide === "bottom") {
      controlY1 += edge.fromSide === "top" ? -controlOffset : controlOffset
    } else if (edge.fromSide === "left" || edge.fromSide === "right") {
      controlX1 += edge.fromSide === "left" ? -controlOffset : controlOffset
    }

    if (edge.toSide === "top" || edge.toSide === "bottom") {
      controlY2 += edge.toSide === "top" ? -controlOffset : controlOffset
    } else if (edge.toSide === "left" || edge.toSide === "right") {
      controlX2 += edge.toSide === "left" ? -controlOffset : controlOffset
    }

    return `M ${fromPoint.x} ${fromPoint.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toPoint.x} ${toPoint.y}`
  }

  // Convert markdown-like text to HTML
  const formatText = (text: string) => {
    return text
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '• $1')
      .replace(/\n/g, '<br/>')
  }

  return (
    <div className={classNames("canvas-viewer", className)}>
      {title && <h2 className="canvas-title">{title}</h2>}
      <div className="canvas-container">
        <svg
          width="100%"
          height="600"
          viewBox={viewBox}
          className="canvas-svg"
          style={{ border: "1px solid var(--border)" }}
        >
          {/* Render edges first so they appear behind nodes */}
          {canvasData.edges.map((edge) => {
            const path = createEdgePath(edge)
            return (
              <g key={edge.id}>
                <path
                  d={path}
                  stroke={edge.color || "#666"}
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
                {edge.label && (
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    className="edge-label"
                    fontSize="12"
                    fill={edge.color || "#666"}
                  >
                    <textPath href={`#${edge.id}-path`}>{edge.label}</textPath>
                  </text>
                )}
              </g>
            )
          })}
          
          {/* Render nodes */}
          {canvasData.nodes.map((node) => (
            <g key={node.id}>
              <rect
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                fill={node.color || "var(--light)"}
                stroke="var(--border)"
                strokeWidth="1"
                rx="8"
                className="canvas-node"
              />
              {node.text && (
                <foreignObject
                  x={node.x + 10}
                  y={node.y + 10}
                  width={node.width - 20}
                  height={node.height - 20}
                >
                  <div
                    className="canvas-node-content"
                    dangerouslySetInnerHTML={{
                      __html: formatText(node.text)
                    }}
                  />
                </foreignObject>
              )}
            </g>
          ))}
          
          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#666"
              />
            </marker>
          </defs>
        </svg>
      </div>
    </div>
  )
}

CanvasViewer.css = style
CanvasViewer.afterDOMLoaded = script

export default (() => CanvasViewer) satisfies QuartzComponentConstructor