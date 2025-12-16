# Financial Management Application - Design Guidelines

## Design Approach: Design System-Based

**Selected System**: Hybrid approach drawing from **Linear** (productivity focus) + **Stripe** (financial trust) + **Shadcn/UI** conventions

**Justification**: This financial management application is utility-focused with information-dense content requiring efficiency, trust, and learnability. Standard UI patterns with professional polish serve users better than visual experimentation.

**Core Principles**:
- Data clarity over decoration
- Role-based visual hierarchy
- Trust through consistency
- Efficient workflows with minimal friction

---

## Color Palette

### Dark Mode (Primary)
- **Background Base**: 222 47% 11% (deep slate)
- **Background Elevated**: 222 47% 15% (cards, modals)
- **Background Subtle**: 217 33% 17% (hover states)
- **Primary Brand**: 217 91% 60% (blue - trust, finance)
- **Success/Approved**: 142 71% 45% (green)
- **Warning/Pending**: 38 92% 50% (amber)
- **Danger/Rejected**: 0 84% 60% (red)
- **Text Primary**: 210 40% 98%
- **Text Secondary**: 215 20% 65%
- **Border Default**: 217 33% 25%

### Light Mode
- **Background Base**: 0 0% 100%
- **Background Elevated**: 210 40% 98%
- **Primary Brand**: 217 91% 55%
- **Text Primary**: 222 47% 11%
- **Border Default**: 214 32% 91%

---

## Typography

**Font Stack**: 
- **Primary**: Inter (via Google Fonts CDN)
- **Monospace**: JetBrains Mono (for financial figures, account numbers)

**Scale & Usage**:
- **Headings**: font-semibold tracking-tight
  - H1: text-3xl (dashboards)
  - H2: text-2xl (section headers)
  - H3: text-xl (card headers)
  - H4: text-lg (subsections)
- **Body**: text-sm font-normal (default app text)
- **Financial Figures**: text-base font-mono font-medium tabular-nums
- **Labels**: text-xs font-medium uppercase tracking-wide text-muted-foreground
- **Captions**: text-xs text-muted-foreground

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** for consistency

**Grid Structure**:
- Dashboard: 12-column responsive grid
- Sidebar: Fixed 260px (collapsed: 60px icon-only)
- Content: max-w-7xl mx-auto with px-4 md:px-6 lg:px-8
- Cards: Consistent p-6 with gap-6 between elements
- Forms: gap-4 vertical rhythm

**Responsive Breakpoints**:
- Mobile: < 768px (single column, stacked)
- Tablet: 768px - 1024px (2-column grids)
- Desktop: > 1024px (full layout with sidebar)

---

## Component Library

### Navigation & Structure
- **Sidebar Navigation**: Fixed left, collapsible, role-based menu items with Lucide icons
- **Top Bar**: Breadcrumb navigation, user profile dropdown, notifications bell
- **Page Headers**: Title + action buttons (right-aligned), optional subtitle

### Data Display
- **Transaction Tables**: 
  - Sticky header with sortable columns
  - Row hover state with border-l-4 status indicator (pending=amber, approved=green, rejected=red)
  - Compact row height (h-12) with ellipsis for overflow
  - Action menu (3-dot) on hover
  
- **Dashboard Cards**: 
  - Elevated background with subtle border
  - Icon + label + large metric layout
  - Trend indicators (arrows, percentages)
  - Sparkline charts for at-a-glance trends

- **Charts**: 
  - Chart.js with custom color scheme matching palette
  - Bar charts for category breakdown
  - Line charts for trends (stroke-width: 2)
  - Donut charts for client contribution
  - Grid lines: subtle, dashed

### Forms & Inputs
- **Form Layout**: 2-column on desktop (grid-cols-2 gap-4), single column mobile
- **Input Fields**: Shadcn Input with floating labels, clear error states
- **Select Dropdowns**: Shadcn Select with search for long lists (clients, categories)
- **Currency Selector**: Radio group with prominent INR/USD toggle, conversion rate input appears conditionally
- **Date Pickers**: Shadcn Calendar with range selection for reports

### Interactive Elements
- **Buttons**:
  - Primary: bg-primary text-primary-foreground (for approve, submit)
  - Destructive: bg-destructive (for reject, delete)
  - Outline: variant="outline" (for cancel, secondary actions)
  - Ghost: variant="ghost" (for table actions)
  
- **Status Badges**: 
  - Pending: bg-amber-500/10 text-amber-500 border-amber-500/20
  - Approved: bg-green-500/10 text-green-500 border-green-500/20
  - Rejected: bg-red-500/10 text-red-500 border-red-500/20

- **Approval Actions**: 
  - Card-based layout showing transaction details
  - Side-by-side approve/reject buttons
  - Confirmation dialog before final action

### Overlays
- **Modals**: Shadcn Dialog, max-w-2xl, with clear header/footer separation
- **Drawers**: Shadcn Sheet from right for transaction details (600px width)
- **Toasts**: Top-right position, auto-dismiss 5s, with icons

---

## Role-Based UI Differences

### Admin View
- Sidebar: Full access (users, approvals, all reports)
- Dashboard: Pending approvals prominently displayed (top), system-wide metrics
- Transaction table: Approve/Reject action buttons visible

### Team View
- Sidebar: Limited (my transactions, add transaction, reports - read-only)
- Dashboard: Personal transaction status overview, submission history
- Transaction table: Status column emphasized, no approval actions

---

## Data Hierarchy & Emphasis

**Visual Weight Priority**:
1. Financial amounts: Largest, monospace, bold
2. Status indicators: Color-coded, prominent
3. Entity names (clients, companies): Medium weight
4. Metadata (dates, creators): Smallest, muted

**Transaction Cards**:
- Amount: Top-right, text-2xl font-mono font-bold
- Type indicator: Icon + label (top-left)
- Company/Client: Below amount, text-sm
- Description: text-muted-foreground, truncated

---

## Animations

**Minimal & Purposeful**:
- Page transitions: None (instant for data apps)
- Hover states: 150ms ease for background color changes
- Toast notifications: Slide-in from top-right (200ms)
- Skeleton loaders: Pulse animation for data fetching
- Chart animations: 800ms ease-out on initial load only

---

## Accessibility & Polish

- Maintain 4.5:1 contrast ratio minimum for all text
- Focus states: ring-2 ring-primary ring-offset-2
- Loading states: Skeleton components matching layout structure
- Empty states: Icon + heading + description + CTA button
- Error states: Inline form errors with clear messaging
- Keyboard navigation: Full support for form submission and table navigation

---

## Images

**No hero images** - This is a dashboard application. Use:
- **Empty State Illustrations**: Custom SVG illustrations for "no transactions," "no clients" states (line-art style, primary color)
- **User Avatars**: Circle placeholders with initials, 40px default size
- **Company Logos**: Optional 32px square logos in company selectors