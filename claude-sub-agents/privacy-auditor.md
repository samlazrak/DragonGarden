# Privacy Auditor Sub-Agent

## Purpose
Scan content for sensitive information, validate sanitization rules, ensure HIPAA compliance for medical content, and protect personal/private data from public exposure.

## Capabilities
1. **Sensitive Data Detection**: Identify PII, PHI, and confidential information
2. **Compliance Checking**: Ensure HIPAA, GDPR, and privacy regulations
3. **Sanitization Validation**: Verify sanitization scripts work correctly
4. **Risk Assessment**: Evaluate privacy risks in new content

## Usage Instructions

### 1. Privacy Scanning Patterns
```javascript
const privacyPatterns = {
  // Personal Identifiable Information
  pii: {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    address: /\d+\s+[\w\s]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)/gi
  },
  
  // Protected Health Information
  phi: {
    patientName: /\b(patient|mr\.|mrs\.|ms\.)\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
    medicalRecord: /\b(MRN|medical record)\s*#?\s*\d+/gi,
    dateOfBirth: /\b(DOB|date of birth)[\s:]+\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/gi,
    diagnosis: /\b(diagnosed with|diagnosis of)\s+[^.]+\./gi
  },
  
  // API Keys and Secrets
  secrets: {
    apiKey: /\b(api[_-]?key|apikey)\s*[:=]\s*["']?[a-zA-Z0-9-_]{20,}["']?/gi,
    token: /\b(token|secret|password)\s*[:=]\s*["']?[a-zA-Z0-9-_]{20,}["']?/gi,
    openai: /\bsk-[a-zA-Z0-9]{48}\b/g,
    anthropic: /\bsk-ant-[a-zA-Z0-9-_]{50,}\b/g
  }
};
```

### 2. Audit Process
1. **Content Scan**
   ```bash
   # Scan all content files
   for file in content/**/*.md; do
     echo "Scanning: $file"
     # Check for patterns
     grep -E "(api_key|password|token|sk-)" "$file" || true
   done
   ```

2. **Sanitization Check**
   ```typescript
   // Verify sanitization config covers all sensitive patterns
   const sanitizationConfig = require('./scripts/sanitize-config.json');
   const missingPatterns = findMissingSanitizationPatterns(privacyPatterns, sanitizationConfig);
   ```

3. **HIPAA Compliance**
   - De-identification standards (Safe Harbor method)
   - Minimum necessary standard
   - Audit trail requirements

### 3. Risk Assessment Matrix
| Content Type | Risk Level | Action Required |
|-------------|------------|-----------------|
| Medical case studies | High | Remove all identifiers, use pseudonyms |
| Technical documentation | Medium | Scan for API keys, credentials |
| Philosophy essays | Low | Basic PII scan |
| Personal blog posts | Medium | Check for location data, personal details |

### 4. Automated Remediation
```javascript
class PrivacyAuditor {
  async auditFile(filePath) {
    const content = await readFile(filePath);
    const findings = [];
    
    // Scan for each pattern type
    for (const [category, patterns] of Object.entries(privacyPatterns)) {
      for (const [type, regex] of Object.entries(patterns)) {
        const matches = content.match(regex);
        if (matches) {
          findings.push({
            category,
            type,
            matches: matches.map(m => this.redact(m)),
            severity: this.calculateSeverity(category, type),
            remediation: this.suggestRemediation(category, type)
          });
        }
      }
    }
    
    return {
      file: filePath,
      clean: findings.length === 0,
      findings,
      riskScore: this.calculateRiskScore(findings)
    };
  }
  
  redact(text) {
    // Partially redact for review
    const length = text.length;
    if (length <= 4) return '*'.repeat(length);
    return text.slice(0, 2) + '*'.repeat(length - 4) + text.slice(-2);
  }
}
```

## Example Audit Report
```markdown
## Privacy Audit Report
Date: 2025-07-25
Files Scanned: 47

### Critical Findings (Immediate Action Required)
1. **File**: content/research/patient-case-study.md
   - **Issue**: Patient name found: "Mr. Jo** **ith"
   - **Action**: Replace with pseudonym

2. **File**: content/demos/ai-config.md
   - **Issue**: API key pattern detected: "sk-**************"
   - **Action**: Remove and use environment variables

### Medium Risk Findings
1. **File**: content/blog/conference-notes.md
   - **Issue**: Email address found
   - **Action**: Consider removing or generalizing

### Recommendations
1. Add pre-commit hook for privacy scanning
2. Update .gitignore with sensitive file patterns
3. Implement automated redaction for markdown files
```

## Integration Points
- Works with `scripts/sanitize.ts` for public repo preparation
- Validates `medical-content-assistant` outputs
- Coordinates with GitHub Actions for CI/CD privacy checks
- Reports to `TodoWrite` for tracking remediation tasks