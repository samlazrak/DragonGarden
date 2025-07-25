import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/preact'
import { h } from 'preact'
import * as Components from '../quartz/components'

describe('AI Features', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AISearch Component', () => {
    it('should render without errors', () => {
      const mockProps = {
        displayClass: 'test',
        cfg: { locale: 'en-US' },
        fileData: { slug: 'test' },
        allFiles: [],
        tree: {},
        ctx: {},
        externalResources: { css: [], js: [] },
        children: []
      }
      
      const { container } = render(h(Components.AISearch, mockProps))
      expect(container).toBeTruthy()
    })
  })

  describe('PrivacyAnalytics Component', () => {
    it('should render analytics dashboard', () => {
      const mockProps = {
        displayClass: 'test',
        cfg: { locale: 'en-US' },
        fileData: { slug: 'test' },
        allFiles: [],
        tree: {},
        ctx: {},
        externalResources: { css: [], js: [] },
        children: []
      }
      
      const { container } = render(h(Components.PrivacyAnalytics, mockProps))
      expect(container.querySelector('.privacy-analytics')).toBeTruthy()
    })
  })

  describe('MedicalCitations Component', () => {
    it('should handle citations in frontmatter', () => {
      const mockProps = {
        displayClass: 'test',
        cfg: { locale: 'en-US' },
        fileData: {
          slug: 'test',
          frontmatter: {
            citations: [{
              id: '1',
              type: 'journal',
              title: 'Test Study',
              authors: ['Smith J', 'Doe J'],
              journal: 'Nature',
              year: 2024,
              doi: '10.1234/test'
            }]
          }
        },
        allFiles: [],
        tree: {},
        ctx: {},
        externalResources: { css: [], js: [] },
        children: []
      }
      
      const { getByText } = render(h(Components.MedicalCitations, mockProps))
      expect(getByText('Test Study')).toBeTruthy()
      expect(getByText('Nature')).toBeTruthy()
    })
  })
})