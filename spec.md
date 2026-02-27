# OOOrgs -- Phase 3a: FinFranFran(tm) Fractionalization Display

## Current State
- Phase 2 is complete: OOO Charitable has campaign cards, detail pages, and a three-tab contribution panel (Cash, In-Kind, Volunteer) wired to the backend
- Backend stores campaigns, donations, gifts, and volunteers
- Campaign detail page shows progress bar, organizer info, and the contribution panel
- No fractionalization model exists yet in backend or frontend

## Requested Changes (Diff)

### Add
- **Backend**: FracUnit type -- each campaign can be divided into a configurable number of units (e.g. 1000 units at a unit price). Track total units, units claimed, and unit price per campaign
- **Backend**: `setCampaignFractionalization` -- set total units and unit price for a campaign
- **Backend**: `claimFracUnits` -- claim N units for a named participant (simulated, no wallet yet)
- **Backend**: `getFracUnitsByCampaign` -- return all unit claims for a campaign
- **Frontend**: `FinFranFranPanel.tsx` -- a dedicated UI panel for the fractionalization model, shown on the campaign detail page beneath the contribution section:
  - Visual unit grid (e.g. 100 cells representing % of 1000 units) showing claimed vs available
  - Unit price display (e.g. "1 Unit = $50")
  - Unit selector (1, 5, 10, 25, 50 units) with running cost calculation
  - "Claim Units" form: name + unit count + confirm
  - Live claimed/available counter
  - Short explainer: what FinFranFran means (fractionalized participation in large projects)

### Modify
- **CampaignDetailPage.tsx**: Add `FinFranFranPanel` beneath the existing contribution tabs
- Seed 2-3 campaigns with fractionalization data (total units + unit price) via backend calls on app load if none exist

### Remove
- Nothing removed

## Implementation Plan
1. Add FracUnit types and functions to backend (Motoko): setCampaignFractionalization, claimFracUnits, getFracUnitsByCampaign
2. Regenerate backend.d.ts
3. Build FinFranFranPanel.tsx component with unit grid, selector, claim form
4. Wire panel into CampaignDetailPage.tsx
5. Seed fractionalization data for existing campaigns on app init

## UX Notes
- The unit grid should be visually striking -- use forest green for claimed, parchment/outline for available
- Keep the FinFranFran explainer brief and accessible (non-financial-jargon)
- Unit claim is simulated (no wallet) -- just stores name + count in backend
- Show a confirmation toast when units are claimed successfully
