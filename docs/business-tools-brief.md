# Limex Business Tools — implementation brief

## Confirmed scope

Build every calculator and document builder currently listed in the Business Tools menu, inside the Limex project. Client HTML and Figma files are references, not final designs or authoritative fee schedules. No external builder dependency.

### Calculators

1. Limited company cost: a focused authorised-capital estimate with RJSC filing, MoA/AoA stamps, name-clearance and Limex professional fees itemised.
2. Trade licence: DNCC and DSCC tariff catalogue, paid-up-capital bands for limited companies, one-to-five-year licence periods, signboard and advertisement tax, VAT, form/book/other charges, source tax, arrears and late-renewal surcharge. Other authorities continue to accept an assessed fee instead of inventing a tariff.
3. RJSC fees: registration cost planning, distinct from the full company budget.
4. Personal income tax: assessment year, category, income, rebate, credits, slabs and minimum tax.
5. VAT: inclusive/exclusive amounts, selected rate and a transparent breakdown.
6. Trademark: classes and application stages with government/professional costs separated.
7. IRC/ERC: import/export registration and renewal estimates.

### Document builders

1. Office rental deed — English / Bangla.
2. Trade licence closure / cancellation application.
3. Partnership deed — English / Bangla.
4. Memorandum / Articles of Association.
5. Memorandum of Understanding.
6. Employment agreement.

## Experience

- Keep “Move faster with practical tools.” Simple, fully clickable cards; five across on desktop, thoughtfully sized on mobile.
- Separate Calculators and Document Builders. Every tool has a shareable `/business-tools/...` page.
- Reusable calculator/builder components do not own site navigation and can be hosted in a dialog later. This release uses pages, not duplicate popup flows.
- Clear field labels, restrained warm neutrals, spacious hierarchy, accessible controls and visible primary actions.
- Results are readable immediately. Rules, fee sources and limitations live in a secondary tab; calculators do not carry a desktop rules rail.
- Builders offer structured inputs, preview, text download and print/PDF. Drafts are not represented as government-approved or legally reviewed documents.
- Optional service requests collect name and phone, retain tool context with consent, and succeed only after backend persistence.

## Backend and administration

- Server validation and calculation; never trust a client-supplied total.
- Versioned editable fee/rule settings, sources and effective periods. Company setup has an admin-editable RJSC capital-band and stamp-tier schedule; trade licence has separate DNCC/DSCC tariff, capital-band, signage, advertising, surcharge and related-charge editors.
- Admin request inbox with status management; idempotent submissions and basic abuse limits.
- Do not save a visitor’s document or tax details merely because they use a tool. Save request context only when they explicitly submit it.
- Additive MySQL migration; preserve current landing-page/admin work and existing content.

## Source safety

- The client trade-licence table explicitly contains placeholders. The existing company calculator, Figma and supplied HTML disagree; the supplied company capital figures are examples, not verified government tariffs.
- Company setup defaults use the current RJSC portal schedule: ৳500/name clearance, ৳1,200 filing, ৳1,000 MoA stamp, capital-tiered AoA stamp and authorised-capital fees. Administrators can publish changes without a code deployment.
- Some prototype buttons show simulated success and the company name checker fabricates a preliminary availability result. Do not carry those behaviours into production.
- Use dated official NBR/RJSC/DPDT/CCI&E/local-authority sources. Where no verified tariff is available, support an authority-assessed amount and clearly identify pending fees. Admin can publish confirmed schedules later.
- The trade-licence seed follows the Dhaka North, Dhaka South and Chattogram column of the official City Corporation Model Tax Schedule, 2016. DNCC and DSCC e-revenue receipts also expose separate licence, signboard, source-tax, VAT, book and other-fee lines; VAT, book and other defaults remain editable planning values because the authority’s final receipt is case-specific.
- Show exemptions, excluded cases and dated assumptions with each estimate; never imply a final tax return, confirmed appointment or completed government filing.

## Verification

Check arithmetic and slab boundaries, missing/invalid inputs, stale results, server errors, duplicate requests, admin authorization, document preview/export, all menu destinations, and desktop/mobile overflow. Run type checks and the additive migration. Avoid building into the running development server’s output directory.
