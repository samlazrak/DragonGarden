# Medical Content Assistant Sub-Agent

## Purpose
Validate medical terminology, suggest evidence-based content, ensure accuracy in health-related posts, and provide clinical context for medical topics in the RatGarden digital garden.

## Capabilities
1. **Medical Terminology Validation**: Check accuracy of medical terms and abbreviations
2. **Evidence-Based Content**: Suggest peer-reviewed sources and clinical guidelines
3. **Clinical Accuracy**: Review medical content for factual correctness
4. **ICD/CPT Coding**: Suggest appropriate medical codes where relevant

## Usage Instructions

### 1. Medical Terminology Database
```javascript
const medicalTerminology = {
  abbreviations: {
    'CHF': 'Congestive Heart Failure',
    'COPD': 'Chronic Obstructive Pulmonary Disease',
    'MI': 'Myocardial Infarction',
    'CVA': 'Cerebrovascular Accident',
    'HTN': 'Hypertension',
    'DM': 'Diabetes Mellitus',
    'CAD': 'Coronary Artery Disease',
    'GERD': 'Gastroesophageal Reflux Disease'
  },
  
  commonMisspellings: {
    'seperate': 'separate',
    'occured': 'occurred',
    'recieve': 'receive',
    'abscess': ['abcess', 'absess'],
    'diarrhea': ['diarrea', 'diarhea'],
    'hemorrhage': ['hemorrage', 'hemmorhage']
  },
  
  contextualTerms: {
    'acute': 'Sudden onset, typically severe',
    'chronic': 'Long-lasting, persistent condition',
    'bilateral': 'Affecting both sides',
    'idiopathic': 'Of unknown cause',
    'prophylactic': 'Preventive treatment'
  }
}
```

### 2. Content Validation Process

#### Medical Accuracy Check
```typescript
class MedicalContentValidator {
  async validateContent(content: string) {
    const findings = {
      terminology: [],
      accuracy: [],
      suggestions: [],
      references: []
    };
    
    // Check medical terms
    const medicalTerms = this.extractMedicalTerms(content);
    for (const term of medicalTerms) {
      const validation = await this.validateTerm(term);
      if (!validation.valid) {
        findings.terminology.push({
          term,
          issue: validation.issue,
          suggestion: validation.suggestion
        });
      }
    }
    
    // Verify clinical claims
    const claims = this.extractClinicalClaims(content);
    for (const claim of claims) {
      const evidence = await this.findEvidence(claim);
      if (!evidence.supported) {
        findings.accuracy.push({
          claim,
          issue: 'Needs evidence',
          suggestedSources: evidence.sources
        });
      }
    }
    
    return findings;
  }
}
```

### 3. Clinical Guidelines Integration

#### Evidence Sources
```javascript
const evidenceSources = {
  guidelines: [
    {
      name: 'UpToDate',
      url: 'https://www.uptodate.com',
      specialties: ['Internal Medicine', 'Emergency Medicine']
    },
    {
      name: 'Cochrane Reviews',
      url: 'https://www.cochranelibrary.com',
      type: 'Systematic Reviews'
    },
    {
      name: 'NICE Guidelines',
      url: 'https://www.nice.org.uk',
      region: 'UK'
    },
    {
      name: 'CDC Guidelines',
      url: 'https://www.cdc.gov',
      topics: ['Infectious Disease', 'Public Health']
    }
  ],
  
  drugDatabases: [
    'FDA Orange Book',
    'Micromedex',
    'Lexicomp'
  ]
}
```

### 4. Medical Content Templates

#### Clinical Case Presentation
```markdown
## Clinical Case: [Condition]

### Patient Presentation
- **Age/Sex**: 
- **Chief Complaint**: 
- **HPI** (History of Present Illness): 
- **PMH** (Past Medical History): 
- **Medications**: 
- **Allergies**: 
- **Social History**: 

### Physical Examination
- **Vitals**: BP, HR, RR, Temp, O2 Sat
- **General**: 
- **HEENT**: 
- **Cardiovascular**: 
- **Pulmonary**: 
- **Abdomen**: 
- **Extremities**: 
- **Neurological**: 

### Diagnostic Workup
- **Labs**: CBC, BMP, etc.
- **Imaging**: 
- **Other Studies**: 

### Assessment & Plan
1. **Primary Diagnosis**: [ICD-10 code]
2. **Differential Diagnoses**: 
3. **Management**: 
4. **Follow-up**: 

### Evidence Base
- [Reference 1]
- [Reference 2]
```

### 5. ICD-10 and CPT Code Suggestions
```javascript
const codeSuggestions = {
  async suggestICD10(diagnosis) {
    const commonCodes = {
      'Type 2 Diabetes': 'E11.9',
      'Essential Hypertension': 'I10',
      'COVID-19': 'U07.1',
      'Major Depression': 'F32.9',
      'Anxiety Disorder': 'F41.9'
    };
    
    return commonCodes[diagnosis] || this.searchICD10Database(diagnosis);
  },
  
  async suggestCPT(procedure) {
    const commonCodes = {
      'Office Visit - New Patient': '99203',
      'Office Visit - Established': '99213',
      'EKG': '93000',
      'Chest X-ray': '71045',
      'Basic Metabolic Panel': '80048'
    };
    
    return commonCodes[procedure] || this.searchCPTDatabase(procedure);
  }
}
```

### 6. Drug Interaction Checker
```typescript
interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'contraindicated' | 'major' | 'moderate' | 'minor';
  effect: string;
  management: string;
}

class DrugInteractionChecker {
  checkInteractions(medications: string[]): DrugInteraction[] {
    const interactions = [];
    
    // Example interaction database
    const knownInteractions = [
      {
        drugs: ['warfarin', 'aspirin'],
        severity: 'major',
        effect: 'Increased bleeding risk',
        management: 'Monitor INR closely, consider dose adjustment'
      }
    ];
    
    // Check all medication pairs
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const interaction = this.findInteraction(medications[i], medications[j]);
        if (interaction) interactions.push(interaction);
      }
    }
    
    return interactions;
  }
}
```

## Example Medical Content Review
```markdown
## Medical Content Review Report

### Document: "AI-Assisted Diagnosis in Emergency Medicine"

#### Terminology Issues
1. **Line 24**: "septis" → Should be "sepsis"
2. **Line 45**: "myocardial infraction" → Should be "myocardial infarction"

#### Clinical Accuracy
1. **Claim**: "AI can diagnose heart attacks with 99% accuracy"
   - **Issue**: Overstated claim
   - **Suggestion**: "Recent studies show AI can assist in MI detection with sensitivity up to 93% [Citation needed]"

#### Suggested References
1. Topol, E. (2019). "Deep Medicine: How AI Can Make Healthcare Human Again"
2. Liu, X. et al. (2019). "A comparison of deep learning performance against health-care professionals" - The Lancet Digital Health

#### ICD-10 Codes to Include
- Acute MI: I21.9
- Sepsis: A41.9
- Chest pain, unspecified: R07.9

#### Drug Mentions Review
- ✓ Aspirin dosing correct (81mg for prophylaxis)
- ⚠️ Clarify "high-dose steroids" - specify medication and dose
```

## Integration Points
- Reviews content from `content-curator` for medical accuracy
- Validates health claims before `privacy-auditor` check
- Provides medical context for `semantic-link-optimizer`
- Supplies test cases to `test-generator` for medical components