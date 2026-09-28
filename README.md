# CCNA Launchpad v1.2.0

An introductory networking study companion. The first complete foundations workshop adds deeper instruction to the trustworthy-feedback changes in v1.1.4. The rest of the CCNA summaries still need curriculum development; this is not a comprehensive exam course.

Live site: https://jpez2051.github.io/CCNA-lab/

## What changed

### v1.2.0 foundations workshop

- Four connected units: following an application request, reading host settings, subnet boundaries, and evidence-based name-resolution troubleshooting.
- Optional starting check recommends a unit without locking learners out.
- Original workplace scenarios, step-by-step worked examples, a plain-language glossary, and a request-path explainer.
- Guided scratch work and expandable hints/solutions are separate from fresh first-submission scenarios.
- Generated /24–/29 subnet exercises require network, broadcast, first/last usable address, and host count. Other scenarios check next-hop reasoning, host configuration, and troubleshooting decisions.
- Feedback explains each result. A hint marks the attempt as helped; only one submission is recorded per scenario. “No in-app hint” is not a claim that outside help was absent.
- Reflections are saved as ungraded notes. Markdown downloads include notes and up to 100 recent scenario records, explicitly not a certification.
- Workshop progress is distinct from the 23 short lesson summaries. Existing v1.1.4 lab evidence remains valid because the lab-validation version is unchanged.

### v1.1.4 reliability changes

- Removed the day streak, mastery percentage, unsupported lesson-duration estimates, inflated accuracy score, and promised 12-week schedule.
- Reading is self-reported, first answers are tracked per stable question ID, and guided exercises have separately verified records.
- Explicit retries do not rewrite first answers. Repeated clicks cannot add attempts.
- Mixed practice prioritizes least-practiced questions and shuffles ties. Three completed ten-question rounds reach all 23 questions in the current bank. Unanswered questions do not count as practiced.
- Latest incorrect answers lead back to the relevant lesson.
- The lab checker evaluates the current supported configuration and requires inspection after configuration changes. Changing a target clears current verification; a previously verified attempt remains historical evidence.
- Route prefixes are calculated from validated contiguous subnet masks. The simulator explicitly does not simulate route installation, links, forwarding, OSPF neighbors, or interface ACL application.
- Exact command hints are expandable rather than always visible.
- Lab-associated lessons stay open after marking them read, preserving the learner's selected answer and scroll position.
- Removed runtime hotfix overrides; curriculum, persistence, simulator, and UI are separate files.

## Progress migration

The existing ccnaLaunchpad storage key is retained. Schema version 2 preserves lesson reads and archives the original record under legacy. Previous aggregate quiz scores are not used in the new first-answer metric. Earlier lab completions remain in legacyLabsDone, but are not counted as verified by the corrected checker until repeated.

Question IDs such as f1:q1 should change when an assessment's meaning changes. Lab validation uses LAB_VALIDATION_VERSION independently of the application release number; bump it only when changing what counts as valid evidence.

Corrupt JSON is not silently overwritten. The user can continue in memory or explicitly reset. Save failures are surfaced in the interface. No backend or cloud sync is configured in this release.

## Firebase direction

ProgressStore provides asynchronous load, save, and clear methods. Writes are serialized with immutable snapshots. A future adapter can be installed before app startup with ProgressStore.use(adapter).

Firebase Hosting alone will not synchronize learning records. The future cloud release needs an explicit Firebase project, authentication, a per-user data model (for example Firestore), ownership rules, local-to-cloud migration and conflict handling, and offline/error behavior. Do not embed service-account credentials in the static app. Existing local records must be offered for migration to the authenticated account, not silently discarded or merged between users.

This boundary prepares the application code for that work; it is not a completed Firebase integration.

## Development and testing

No build step or production package dependencies are required. Serve the directory with a static HTTP server.

Run deterministic regression checks with Node 22 or newer:

    npm test

Browser checks use Playwright. Install it separately, then run:

    npm install --no-save --package-lock=false playwright@1.62.1
    npx playwright install chromium
    npm run test:browser

Alternatively set PLAYWRIGHT_MODULE to an installed Playwright module path and BROWSER_PATH to a compatible browser executable. TEST_URL can point to the published site. Browser checks use isolated browser contexts and do not modify an existing learner profile. Screenshots go to .artifacts (or ARTIFACT_DIR).

Checks cover:
- False lab success, invalidation after changes, valid exit navigation, all IPv4 mask lengths, wrong route masks, and all five guided exercises.
- Read vs. lab navigation, answer deduplication, first-answer persistence, review links, full practice-bank reachability.
- Legacy migration, corrupt records, ordered adapter writes, save failures, and desktop/mobile widths of 1440, 390, and 320 pixels.

GitHub Pages runs the deterministic tests before publishing and uploads only the seven public site assets.

## Next releases

- Continue the foundations approach across the remaining curriculum, with learner feedback before broad expansion.
- v1.3.0: structured troubleshooting and external topology assignments.
- v1.4.0: delayed review and portfolio evidence.
- Future comprehensive release: audited coverage of an explicitly selected Cisco exam blueprint.

## History

- v1.2.0: four-unit foundations workshop, optional diagnostic, generated scenarios, and reflection notes.

- v1.1.4: trustworthy feedback, removal of engagement counters, validated guided practice, and persistence boundary.
- v1.1.3: keep lessons with associated labs open after marking completion.
- v1.1.2: course recommendations and separate lab completion records.
- v1.1.1: prerequisite reading and introductory CLI lesson.
- v1.0.1: GitHub Pages deployment.
- v1.0.0: initial prototype.

CCNA and Cisco are trademarks of Cisco and/or its affiliates. This is an independent study aid, not official Cisco training.
