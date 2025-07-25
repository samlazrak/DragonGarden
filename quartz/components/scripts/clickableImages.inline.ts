document.addEventListener("nav", () => {
  // Check if we have any clickable images on this page
  const clickableImages = document.querySelectorAll('.clickable-image-container')
  if (clickableImages.length === 0) return

  // Only add modal and scripts if clickable images exist and modal doesn't already exist
  if (!document.getElementById('image-modal')) {
    // Add the modal HTML
    const modalHTML = `
<div id="image-modal" class="image-modal">
  <div class="modal-content">
    <span class="close-modal" onclick="closeImageModal()">&times;</span>
    <img id="modal-image" alt="Zoomed image">
  </div>
</div>
    `

    // Add CSS styles
    const styles = `
<style>
.clickable-image-container {
  position: relative;
  display: inline-block;
  cursor: pointer;
  margin: 1rem 0;
  max-width: 100%;
}

.clickable-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.clickable-image:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
}

.clickable-image-container:hover .image-overlay {
  opacity: 1;
}

.zoom-icon {
  font-size: 2rem;
  color: white;
  background: rgba(0, 0, 0, 0.6);
  padding: 0.5rem;
  border-radius: 50%;
  backdrop-filter: blur(5px);
}

.image-modal {
  display: none;
  position: fixed;
  z-index: 9999;
  padding-top: 50px;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  animation: fadeIn 0.3s ease;
}

.modal-content {
  margin: auto;
  display: block;
  width: 90%;
  max-width: 1200px;
  position: relative;
}

#modal-image {
  width: 100%;
  height: auto;
  max-height: 80vh;
  object-fit: contain;
}

.close-modal {
  position: absolute;
  top: -40px;
  right: 0;
  color: #f1f1f1;
  font-size: 40px;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-modal:hover,
.close-modal:focus {
  color: #bbb;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

.modal-fade-out {
  animation: fadeOut 0.3s ease;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    padding-top: 20px;
  }
  
  .close-modal {
    top: -30px;
    font-size: 30px;
  }
  
  .zoom-icon {
    font-size: 1.5rem;
    padding: 0.3rem;
  }
  
  .clickable-image-container {
    margin: 0.75rem 0;
  }
  
  .clickable-image {
    border-radius: 6px;
  }
}

@media (max-width: 480px) {
  .modal-content {
    width: 98%;
    padding-top: 10px;
  }
  
  .close-modal {
    top: -25px;
    font-size: 25px;
  }
  
  .zoom-icon {
    font-size: 1.2rem;
    padding: 0.25rem;
  }
  
  .clickable-image-container {
    margin: 0.5rem 0;
  }
  
  .clickable-image {
    border-radius: 4px;
  }
  
  .image-overlay {
    border-radius: 4px;
  }
}
</style>
    `

    // Add to document body
    document.body.insertAdjacentHTML('beforeend', modalHTML)
    document.head.insertAdjacentHTML('beforeend', styles)

    // Add JavaScript functions to global scope
    ;(window as any).openImageModal = function(imageId: string) {
      const img = document.getElementById(imageId) as HTMLImageElement
      const modal = document.getElementById('image-modal') as HTMLElement
      const modalImg = document.getElementById('modal-image') as HTMLImageElement
      
      if (img && modal && modalImg) {
        modal.style.display = 'block'
        modalImg.src = img.src
        modalImg.alt = img.alt
        document.body.style.overflow = 'hidden'
      }
    }

    ;(window as any).closeImageModal = function() {
      const modal = document.getElementById('image-modal') as HTMLElement
      if (modal) {
        modal.classList.add('modal-fade-out')
        setTimeout(() => {
          modal.style.display = 'none'
          modal.classList.remove('modal-fade-out')
          document.body.style.overflow = 'auto'
        }, 300)
      }
    }

    // Close modal when clicking outside the image
    const modal = document.getElementById('image-modal')
    if (modal) {
      modal.addEventListener('click', function(event) {
        if (event.target === modal) {
          ;(window as any).closeImageModal()
        }
      })
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        ;(window as any).closeImageModal()
      }
    })
  }
})