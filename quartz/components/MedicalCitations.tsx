import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/medicalcitations.scss"

interface Citation {
  id: string
  type: "journal" | "clinical-trial" | "guideline" | "case-study"
  title: string
  authors: string[]
  journal?: string
  year: number
  doi?: string
  pmid?: string
  url?: string
}

const MedicalCitations: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const citations = fileData.frontmatter?.citations as Citation[] || []
  
  if (citations.length === 0) return null

  return (
    <div class={`medical-citations ${displayClass ?? ""}`}>
      <h3>Medical References</h3>
      <div class="citations-list">
        {citations.map((cite, idx) => (
          <div key={cite.id} class={`citation citation-${cite.type}`}>
            <span class="citation-number">[{idx + 1}]</span>
            <div class="citation-content">
              <div class="citation-title">{cite.title}</div>
              <div class="citation-meta">
                <span class="authors">{cite.authors.slice(0, 3).join(", ")}{cite.authors.length > 3 && " et al."}</span>
                {cite.journal && <span class="journal">{cite.journal}</span>}
                <span class="year">({cite.year})</span>
              </div>
              <div class="citation-links">
                {cite.doi && (
                  <a href={`https://doi.org/${cite.doi}`} target="_blank" rel="noopener">
                    DOI
                  </a>
                )}
                {cite.pmid && (
                  <a href={`https://pubmed.ncbi.nlm.nih.gov/${cite.pmid}`} target="_blank" rel="noopener">
                    PubMed
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

MedicalCitations.css = style
MedicalCitations.afterDOMLoaded = `
// Auto-link inline citations
document.addEventListener('DOMContentLoaded', () => {
  const content = document.querySelector('.popover-hint');
  if (!content) return;

  // Find all [1], [2], etc. patterns in content
  const citationPattern = /\\[(\\d+)\\]/g;
  
  content.innerHTML = content.innerHTML.replace(citationPattern, (match, num) => {
    const citation = document.querySelector(\`.citation:nth-child(\${num})\`);
    if (citation) {
      return \`<a href="#citation-\${num}" class="inline-citation">\${match}</a>\`;
    }
    return match;
  });

  // Add IDs to citations for linking
  document.querySelectorAll('.citation').forEach((cite, idx) => {
    cite.id = \`citation-\${idx + 1}\`;
  });

  // Smooth scroll to citations
  document.querySelectorAll('.inline-citation').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('highlight');
        setTimeout(() => target.classList.remove('highlight'), 2000);
      }
    });
  });
});

// Clinical note template system
class ClinicalNoteTemplates {
  constructor() {
    this.templates = {
      'soap': {
        name: 'SOAP Note',
        sections: ['Subjective', 'Objective', 'Assessment', 'Plan']
      },
      'progress': {
        name: 'Progress Note',
        sections: ['Chief Complaint', 'HPI', 'ROS', 'Physical Exam', 'Assessment/Plan']
      },
      'h&p': {
        name: 'History & Physical',
        sections: ['CC', 'HPI', 'PMH', 'Medications', 'Allergies', 'Social Hx', 'Family Hx', 'ROS', 'Physical Exam', 'Labs/Imaging', 'Assessment', 'Plan']
      }
    };
  }

  insertTemplate(type) {
    const template = this.templates[type];
    if (!template) return;

    const sections = template.sections.map(section => \`## \${section}\\n\\n\`).join('');
    
    // If in an editor, insert at cursor
    const activeElement = document.activeElement;
    if (activeElement && activeElement.tagName === 'TEXTAREA') {
      const start = activeElement.selectionStart;
      const end = activeElement.selectionEnd;
      const text = activeElement.value;
      
      activeElement.value = text.substring(0, start) + sections + text.substring(end);
      activeElement.selectionStart = activeElement.selectionEnd = start + sections.length;
      activeElement.focus();
    }
  }
}

window.clinicalTemplates = new ClinicalNoteTemplates();
`

export default (() => MedicalCitations) satisfies QuartzComponentConstructor