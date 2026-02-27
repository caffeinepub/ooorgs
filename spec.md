# OOOrgs -- Phase 2a: Charitable Campaign Data Model & Backend Storage

## Current State
- Backend has a minimal `main.mo` with only a `greet` function
- Frontend has a `CharitablePage.tsx` placeholder showing "Coming in Phase 2"
- App routing is in place: `/charitable`, `/corporations`, `/cooperatives`, `/dao`
- Brand tokens (Forest Green, Burnished Gold, Parchment Cream, Deep Charcoal) are set in `index.css` and `tailwind.config.js`

## Requested Changes (Diff)

### Add
- Backend: `Campaign` data type with fields: id, title, description, category, goalAmount, raisedAmount, contributorCount, organizer, organizerBio, imageUrl, startDate, endDate, isActive, tags
- Backend: Stable storage map for campaigns (`campaigns: StableHashMap`)
- Backend: `createCampaign` -- creates a new campaign (admin)
- Backend: `getCampaigns` -- returns all campaigns as an array
- Backend: `getCampaign(id)` -- returns a single campaign by ID
- Backend: Seed data: 6 diverse sample campaigns pre-populated at deploy time (environment, education, health, community, arts, emergency relief)

### Modify
- `backend.d.ts` will be regenerated with the new campaign API types

### Remove
- Nothing removed

## Implementation Plan
1. Write new `main.mo` with Campaign type, stable storage, and query/update functions
2. Generate Motoko code via the tool
3. Frontend will be updated in Phase 2b to use these APIs

## UX Notes
- Phase 2a is backend-only; no frontend changes yet
- Sample campaigns should represent the diversity of OOOrgs causes (global, local, emergency, long-term)
- Goal amounts should vary widely to demonstrate fractionalization potential (small community projects to large infrastructure)
