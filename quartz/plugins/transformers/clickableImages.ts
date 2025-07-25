import { QuartzTransformerPlugin } from "../types"
import { Root, Image, Parent } from "mdast"
import { visit } from "unist-util-visit"

export const ClickableImages: QuartzTransformerPlugin = () => {
  return {
    name: "ClickableImages",
    markdownPlugins() {
      return [
        () => {
          return (tree: Root, file) => {
            visit(tree, "image", (node: Image, index: number | undefined, parent: Parent | undefined) => {
              // Only process if the image has a valid src
              if (!node.url) return
              
              // Ensure we have a valid parent with children array and valid index
              if (!parent || !parent.children || typeof index !== "number" || index < 0 || index >= parent.children.length) {
                return
              }
              
              // Create the HTML structure for clickable images
              const imageId = `clickable-image-${Math.random().toString(36).substr(2, 9)}`
              
              // Replace the image node with HTML
              const htmlNode = {
                type: "html" as const,
                value: `<div class="clickable-image-container">
  <img 
    id="${imageId}"
    src="${node.url}" 
    alt="${node.alt || ''}" 
    title="${node.title || ''}"
    class="clickable-image"
    loading="lazy"
    onclick="openImageModal('${imageId}')"
  />
  <div class="image-overlay">
    <span class="zoom-icon">🔍</span>
  </div>
</div>`
              }
              
              parent.children[index] = htmlNode
            })
          }
        }
      ]
    },
  }
}