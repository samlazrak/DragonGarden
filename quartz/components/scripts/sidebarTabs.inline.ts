// Left sidebar tab switching
function switchLeftTab(tabName: string) {
  const leftTabs = document.querySelector(".left-sidebar-tabs")
  if (!leftTabs) return

  // Update tab buttons
  const buttons = leftTabs.querySelectorAll(".tab-button")
  buttons.forEach((button) => {
    button.classList.remove("active")
    if (button.getAttribute("data-tab") === tabName) {
      button.classList.add("active")
    }
  })

  // Update tab panels
  const panels = leftTabs.querySelectorAll(".tab-panel")
  panels.forEach((panel) => {
    panel.classList.remove("active")
    if (panel.getAttribute("data-panel") === tabName) {
      panel.classList.add("active")
    }
  })

  // Save preference
  localStorage.setItem("leftSidebarTab", tabName)
}

// Right sidebar tab switching
function switchRightTab(tabName: string) {
  const rightTabs = document.querySelector(".right-sidebar-tabs")
  if (!rightTabs) return

  // Update tab buttons
  const buttons = rightTabs.querySelectorAll(".tab-button")
  buttons.forEach((button) => {
    button.classList.remove("active")
    if (button.getAttribute("data-tab") === tabName) {
      button.classList.add("active")
    }
  })

  // Update tab panels
  const panels = rightTabs.querySelectorAll(".tab-panel")
  panels.forEach((panel) => {
    panel.classList.remove("active")
    if (panel.getAttribute("data-panel") === tabName) {
      panel.classList.add("active")
    }
  })

  // Save preference
  localStorage.setItem("rightSidebarTab", tabName)
}

// Initialize tabs on page load
document.addEventListener("nav", () => {
  // Restore left sidebar tab preference
  const savedLeftTab = localStorage.getItem("leftSidebarTab")
  if (savedLeftTab) {
    switchLeftTab(savedLeftTab)
  }

  // Restore right sidebar tab preference
  const savedRightTab = localStorage.getItem("rightSidebarTab")
  if (savedRightTab) {
    switchRightTab(savedRightTab)
  }
})

// Make functions globally available
;(window as any).switchLeftTab = switchLeftTab
;(window as any).switchRightTab = switchRightTab

// Export for module system
export default ""
