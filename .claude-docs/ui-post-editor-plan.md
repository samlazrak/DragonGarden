# Post Creation/Editing UI Plan

## Overview
A web-based interface for creating and editing posts directly on the RatGarden site, designed to be simple enough for non-technical users (like your sister) while maintaining the power needed for complex content.

## User Requirements
1. **Non-technical users**: Simple, intuitive interface
2. **Direct editing**: No need for Git or markdown knowledge
3. **Visual feedback**: See changes in real-time
4. **Safety**: Prevent accidental deletions or overwrites

## Technical Architecture

### Frontend Components

#### 1. Post Editor Component (`/quartz/components/PostEditor.tsx`)
```typescript
interface PostEditorProps {
  mode: 'create' | 'edit'
  initialContent?: PostData
  onSave: (content: PostData) => Promise<void>
  onCancel: () => void
}

// Features:
- Rich text editor with markdown preview
- Frontmatter form fields
- Auto-save functionality
- Image upload/management
- Template selection
```

#### 2. Editor Toolbar (`/quartz/components/EditorToolbar.tsx`)
- Bold, italic, headers
- Link insertion
- Image upload
- Code blocks
- Lists and quotes
- Clinical note templates (if medical content)

#### 3. Post Manager (`/quartz/components/PostManager.tsx`)
- List all posts
- Search/filter
- Quick actions (edit, delete, publish/draft)
- Bulk operations

### Backend Requirements

#### API Endpoints
```typescript
// POST /api/posts
// GET /api/posts
// GET /api/posts/:slug
// PUT /api/posts/:slug
// DELETE /api/posts/:slug
// POST /api/upload (for images)
```

#### Authentication
- Simple password protection
- Session management
- Rate limiting

### Data Flow
```
User → Editor UI → API → File System → Git → Build Process → Published Site
```

## Implementation Approach

### Phase 1: Minimal Viable Editor (2-3 weeks)
1. **Basic Editor**
   - Simple textarea with markdown preview
   - Frontmatter fields (title, date, tags)
   - Save/Cancel buttons

2. **File Operations**
   - Create new posts in content/
   - Edit existing posts
   - Basic validation

3. **Security**
   - Password protection
   - CORS configuration
   - Input sanitization

### Phase 2: Enhanced Features (2-3 weeks)
1. **Rich Text Editing**
   - Toolbar for formatting
   - Drag-drop images
   - Auto-save drafts

2. **Post Management**
   - List view with search
   - Batch operations
   - Version history

3. **Templates**
   - Pre-built post templates
   - Custom template creation
   - Clinical note templates

### Phase 3: Advanced Features (3-4 weeks)
1. **Visual Editor**
   - WYSIWYG mode
   - Component insertion
   - Real-time preview

2. **Collaboration**
   - Multiple users
   - Permissions system
   - Comments/annotations

3. **Media Management**
   - Image library
   - Automatic optimization
   - CDN integration

## Technical Challenges & Solutions

### 1. File System Access
**Challenge**: Web apps can't directly write to file system
**Solution**: API layer that handles file operations server-side

### 2. Git Integration
**Challenge**: Auto-commit changes without breaking workflow
**Solution**: 
- Queue changes and batch commit
- Optional manual git workflow
- Conflict resolution UI

### 3. Build Triggering
**Challenge**: Rebuild site after edits
**Solution**:
- Webhook to trigger builds
- Background build queue
- Preview before publish

### 4. Authentication
**Challenge**: Secure but simple for non-technical users
**Solution**:
- Magic link authentication
- OAuth with Google/GitHub
- Simple password with 2FA option

## UI/UX Considerations

### For Non-Technical Users
1. **Hide Complexity**
   - No markdown syntax required
   - Visual formatting buttons
   - Guided workflows

2. **Prevent Errors**
   - Confirmation dialogs
   - Undo/redo functionality
   - Auto-save drafts

3. **Clear Feedback**
   - Success/error messages
   - Loading states
   - Progress indicators

### Design Mockup Structure
```
┌─────────────────────────────────────┐
│ [← Back] Post Editor  [Preview] [?] │
├─────────────────────────────────────┤
│ Title: [___________________]        │
│ Date: [____] Tags: [____] [+]       │
├─────────────────────────────────────┤
│ [B][I][H][🔗][📷][</
>][💾]        │
├─────────────────────────────────────┤
│                                     │
│ Content area with rich text         │
│ editing capabilities...             │
│                                     │
├─────────────────────────────────────┤
│ [Save Draft] [Publish] [Cancel]     │
└─────────────────────────────────────┘
```

## Security Considerations

1. **Authentication Required**
   - No public write access
   - Session timeout
   - Secure token storage

2. **Input Validation**
   - Sanitize all inputs
   - Prevent XSS attacks
   - File type restrictions

3. **Rate Limiting**
   - Prevent spam
   - API throttling
   - Storage quotas

## Feasibility Assessment

### Pros:
- Technically achievable with modern web stack
- Can start simple and iterate
- Improves accessibility for non-technical users
- Enhances site utility

### Cons:
- Significant development effort (6-10 weeks full implementation)
- Increases attack surface
- Requires ongoing maintenance
- May complicate deployment

### Alternatives to Consider:

1. **Headless CMS Integration**
   - Use Strapi, Directus, or similar
   - Faster to implement
   - More features out-of-box
   - But: Another service to maintain

2. **GitHub-based Editor**
   - Use GitHub's web editor
   - Prose.io or similar
   - But: Requires GitHub account

3. **Desktop App**
   - Electron app for local editing
   - Direct file system access
   - But: Installation required

## Recommendation

**Start with Phase 1** - A basic web editor that allows creating/editing posts with simple authentication. This can be built in 2-3 weeks and provides immediate value for non-technical users.

**Evaluate after Phase 1** whether to continue building custom or integrate a headless CMS based on:
- User feedback
- Development complexity
- Maintenance burden
- Feature requirements

**For your sister's use case**, even the Phase 1 implementation would be a significant improvement over requiring Git/markdown knowledge.

## Next Steps

1. Decide on authentication method
2. Create API specification
3. Design component architecture
4. Build MVP prototype
5. Test with non-technical users
6. Iterate based on feedback

---
Last Updated: 2025-07-25