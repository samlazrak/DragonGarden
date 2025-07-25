document.addEventListener("DOMContentLoaded", () => {
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

  function createEdgePath(edge: CanvasEdge, nodes: CanvasNode[]): string {
    const fromNode = nodes.find(n => n.id === edge.fromNode)
    const toNode = nodes.find(n => n.id === edge.toNode)
    
    if (!fromNode || !toNode) return ""

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

    const dx = toPoint.x - fromPoint.x
    const dy = toPoint.y - fromPoint.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const controlOffset = Math.min(distance * 0.3, 100)

    let controlX1 = fromPoint.x
    let controlY1 = fromPoint.y
    let controlX2 = toPoint.x
    let controlY2 = toPoint.y

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

  function formatText(text: string): string {
    return text
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '• $1')
      .replace(/\n/g, '<br/>')
  }

  function renderCanvas(container: HTMLElement, canvasData: CanvasData) {
    if (!canvasData || !canvasData.nodes) return

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

    // Create SVG with better sizing
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("width", "100%")
    svg.setAttribute("height", Math.max(600, viewHeight * 0.8).toString())
    svg.setAttribute("viewBox", viewBox)
    svg.setAttribute("class", "canvas-svg")
    svg.style.border = "1px solid var(--border)"
    svg.style.background = "var(--light)"

    // Create arrow marker
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker")
    marker.setAttribute("id", "arrowhead")
    marker.setAttribute("markerWidth", "10")
    marker.setAttribute("markerHeight", "7")
    marker.setAttribute("refX", "9")
    marker.setAttribute("refY", "3.5")
    marker.setAttribute("orient", "auto")
    
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
    polygon.setAttribute("points", "0 0, 10 3.5, 0 7")
    polygon.setAttribute("fill", "#666")
    
    marker.appendChild(polygon)
    defs.appendChild(marker)
    svg.appendChild(defs)

    // Render edges
    canvasData.edges.forEach(edge => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      path.setAttribute("d", createEdgePath(edge, canvasData.nodes))
      path.setAttribute("stroke", edge.color || "#666")
      path.setAttribute("stroke-width", "2")
      path.setAttribute("fill", "none")
      path.setAttribute("marker-end", "url(#arrowhead)")
      svg.appendChild(path)

      // Add label if present
      if (edge.label) {
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
        text.setAttribute("class", "edge-label")
        text.setAttribute("font-size", "12")
        text.setAttribute("fill", edge.color || "#666")
        text.textContent = edge.label
        
        // Position label at midpoint of edge
        const fromNode = canvasData.nodes.find(n => n.id === edge.fromNode)
        const toNode = canvasData.nodes.find(n => n.id === edge.toNode)
        if (fromNode && toNode) {
          const midX = (fromNode.x + fromNode.width/2 + toNode.x + toNode.width/2) / 2
          const midY = (fromNode.y + fromNode.height/2 + toNode.y + toNode.height/2) / 2
          text.setAttribute("x", midX.toString())
          text.setAttribute("y", midY.toString())
          text.setAttribute("text-anchor", "middle")
          text.style.textShadow = "1px 1px 2px rgba(255, 255, 255, 0.8)"
        }
        
        svg.appendChild(text)
      }
    })

    // Render nodes with interactivity
    canvasData.nodes.forEach(node => {
      const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
      nodeGroup.setAttribute("class", "canvas-node-group")
      nodeGroup.style.cursor = "pointer"

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      rect.setAttribute("x", node.x.toString())
      rect.setAttribute("y", node.y.toString())
      rect.setAttribute("width", node.width.toString())
      rect.setAttribute("height", node.height.toString())
      rect.setAttribute("fill", node.color || "#f8f9fa")
      rect.setAttribute("stroke", "#dee2e6")
      rect.setAttribute("stroke-width", "2")
      rect.setAttribute("rx", "8")
      rect.setAttribute("class", "canvas-node")
      
      // Add hover effects
      nodeGroup.addEventListener("mouseenter", () => {
        rect.setAttribute("stroke", "#007bff")
        rect.setAttribute("stroke-width", "3")
        rect.style.filter = "brightness(1.05)"
      })
      
      nodeGroup.addEventListener("mouseleave", () => {
        rect.setAttribute("stroke", "#dee2e6")
        rect.setAttribute("stroke-width", "2")
        rect.style.filter = "none"
      })
      
      nodeGroup.appendChild(rect)

      if (node.text) {
        const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")
        foreignObject.setAttribute("x", (node.x + 8).toString())
        foreignObject.setAttribute("y", (node.y + 8).toString())
        foreignObject.setAttribute("width", (node.width - 16).toString())
        foreignObject.setAttribute("height", (node.height - 16).toString())
        
        const div = document.createElement("div")
        div.className = "canvas-node-content"
        div.style.padding = "8px"
        div.style.fontSize = "12px"
        div.style.lineHeight = "1.4"
        div.style.color = "var(--dark)"
        div.style.overflow = "hidden"
        div.style.wordWrap = "break-word"
        div.innerHTML = formatText(node.text)
        
        foreignObject.appendChild(div)
        nodeGroup.appendChild(foreignObject)
      }
      
      svg.appendChild(nodeGroup)
    })

    container.innerHTML = ""
    container.appendChild(svg)
  }

  // Find and render all canvas viewers
  const canvasViewers = document.querySelectorAll<HTMLElement>(".canvas-viewer")
  canvasViewers.forEach(viewer => {
    const canvasDataAttr = viewer.getAttribute("data-canvas")
    if (canvasDataAttr) {
      try {
        const canvasData = JSON.parse(canvasDataAttr)
        const container = viewer.querySelector(".canvas-container")
        if (container) {
          renderCanvas(container as HTMLElement, canvasData)
        }
      } catch (error) {
        console.error("Failed to parse canvas data:", error)
      }
    }
  })
})

export {}