# CCNA Launchpad v1.1.2

A beginner-first browser learning app for CCNA 200-301 study.

## Live test site
Once GitHub Pages finishes deployment, open:

https://jpez2051.github.io/CCNA-lab/

The Pages workflow deploys automatically whenever `main` changes, so the live site can be used on a phone while we test future versions.

## Included
- Beginner-guided course across all six CCNA domains
- 20+ focused lessons with knowledge checks
- Progress stored in browser localStorage
- Mixed practice mode
- Five Cisco-style interactive CLI labs
- 12-week roadmap
- Responsive UI
- GitHub Pages deployment workflow

## Design philosophy
The application intentionally favors short conceptual lessons plus active recall and configuration over long passive lectures. It is not a replacement for real Cisco IOS, Packet Tracer, CML, GNS3, or EVE-NG; the built-in CLI is a learning simulator that covers a deliberately small command set.

## Version history
- v1.1.2: mastery returns to the course with a highlighted next step; required labs remain pending until their checklist is complete. Lab completion is saved separately, mastered lessons remain available for review, and static-route practice follows its configuration prerequisite.
- v1.1.1: beginner CLI lesson and lab prerequisites
- v1.0.0: initial CCNA Launchpad application
- v1.0.1: GitHub Pages deployment and phone-access testing workflow

## Recommended next versions
- Future: real topology canvas, packet animations, subnetting trainer, spaced repetition
- v1.2.0: larger IOS command grammar, troubleshooting scenarios, lab scoring
- v1.3.0: full mock exams, weak-topic analytics, bookmarks/notes, exportable progress

## v1.1.2 validation
- Browser checks at desktop (1440px) and mobile (390px and 320px) widths cover mastery, course recommendations, review, reload persistence, lab prerequisites, and completion.
- Existing lesson progress is preserved. Earlier versions did not save lab completion, so previous lab attempts cannot be inferred; those practicals will initially appear pending.
- Course percentages measure lesson mastery; practical completion is shown separately.

## Important
CCNA and Cisco are trademarks of Cisco and/or its affiliates. This project is an independent study aid and is not official Cisco training.
