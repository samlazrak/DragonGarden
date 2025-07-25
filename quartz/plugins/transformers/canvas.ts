import { QuartzTransformerPlugin } from "../types"
import { PluginTypes } from "../types"
import { Root } from "hast"
import { visit } from "unist-util-visit"
import { toString } from "hast-util-to-string"
import { h } from "hastscript"
import path from "path"
import { readFileSync } from "fs"

export interface Options {
  /**
   * Whether to embed canvas files directly in the page
   * @default true
   */
  embedCanvas: boolean
  
  /**
   * Default width for canvas viewer
   * @default "100%"
   */
  defaultWidth: string
  
  /**
   * Default height for canvas viewer
   * @default "600px"
   */
  defaultHeight: string
}

const defaultOptions: Options = {
  embedCanvas: true,
  defaultWidth: "100%",
  defaultHeight: "600px",
}

export const Canvas: QuartzTransformerPlugin<Options> = (userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }
  
  return {
    name: "Canvas",
    markdownPlugins() {
      return [
        () => {
          return (tree, file) => {
            // Process canvas file links in markdown
            visit(tree, ["link", "image"], (node, index, parent) => {
              if (node.url && (node.url.endsWith('.canvas') || node.url.endsWith('.json'))) {
                // Convert canvas link to a special canvas embed
                let canvasPath = node.url
                
                // Handle relative paths
                if (canvasPath.startsWith('./')) {
                  canvasPath = canvasPath.substring(2)
                }
                
                // Try different path resolutions with proper URL decoding
                const decodedUrl = decodeURIComponent(node.url)
                const decodedCanvasPath = decodeURIComponent(canvasPath)
                
                const possiblePaths = [
                  path.resolve(path.dirname(file.path || ''), decodedUrl),
                  path.resolve(path.dirname(file.path || ''), node.url),
                  path.resolve('content', decodedCanvasPath),
                  path.resolve('content', canvasPath),
                  path.resolve('content', decodedUrl.replace('./', '')),
                  path.resolve('content', node.url.replace('./', '')),
                  path.resolve('content/media', path.basename(decodedCanvasPath)),
                  path.resolve('content/media', path.basename(canvasPath)),
                  path.resolve('content/media', path.basename(decodedUrl)),
                  path.resolve('content/media', path.basename(node.url))
                ]
                
                for (const tryPath of possiblePaths) {
                  try {
                    const canvasContent = readFileSync(tryPath, 'utf8')
                    const canvasData = JSON.parse(canvasContent)
                    
                    // Create a canvas embed node
                    const canvasEmbed = {
                      type: 'html',
                      value: `<div class="canvas-viewer" data-canvas='${JSON.stringify(canvasData).replace(/'/g, "&#39;")}'>
                        <div class="canvas-container">
                          <div class="canvas-loading">Loading canvas...</div>
                        </div>
                      </div>`
                    }
                    
                    if (parent && index !== undefined) {
                      parent.children[index] = canvasEmbed
                    }
                    return
                  } catch (error) {
                    continue
                  }
                }
              }
            })
          }
        }
      ]
    },
    
    htmlPlugins() {
      return []
    }
  }
}

declare module "vfile" {
  interface DataMap {
    canvas: boolean
  }
}