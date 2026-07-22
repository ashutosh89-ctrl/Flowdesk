# FlowDesk Technical Decisions Log

## Key Decisions

### 1. Dual-Mode Database Execution (Resilient Fallback)
- **Decision**: Introduce an `isPlaceholder` evaluation in `dataService.ts`.
- **Rationale**: Enables FlowDesk to continue executing smoothly in sandbox preview iframe environments when credentials are set to default values while instantly activating standard Supabase behavior upon custom credentials entry. This prevents runtime failures or empty UI elements.

### 2. Auto-Casing Transformer Middleware
- **Decision**: Formulate automatic bidirectional key serializers (`keysToSnake`, `keysToCamel`) inside the `dataService.ts` gateway layer.
- **Rationale**: Keeps database row schema matching standard PostgreSQL conventions (`snake_case`) while maintaining absolute consistency with the unlocked high-fidelity React frontend codebases (`camelCase`). Avoids any refactoring on locked components.

### 3. Unified Single-File Build Bundling for Servers
- **Decision**: Keep the dev and build configuration unified under Vite.
- **Rationale**: Minimizes dependencies, ensures faster container boots, and conforms to standard React/TypeScript Single Page Application architectures.

### 4. Accent Picker Preservation in Settings
- **Decision**: Remove light/dark selection while maintaining Accent Brand selection.
- **Rationale**: Adheres to the directive "Remove theme toggle, keep profile/workspace/billing/notifications settings." Keeps customizable accent colors as a high-fidelity visual identity marker.
