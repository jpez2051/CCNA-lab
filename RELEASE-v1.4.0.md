# v1.4.0 — Advanced practice and full-session exam rehearsal

## Implemented

- Six new external build guides: LACP/Rapid PVST+, SVI inter-VLAN routing, OSPFv2, IPv6/OSPFv3, PAT and routed DHCP relay. There are now twelve practicals including the earlier capstone. Advanced guides include a topology, configuration example, injected faults, operational verification and independent transfer tasks.
- Four bounded browser evidence trainers: LACP negotiation, OSPF adjacency versus route learning, PAT selection versus application response, and ACL ordering/attachment. They require a prediction, evidence before changes, successful checks after the latest change and a written explanation. Hints are recorded; explanations are ungraded.
- A 100-item, 120-minute full-session rehearsal, comprising the original 40 pilot questions plus 60 new original questions. It samples all 29 top-level v2.0 objectives and has domain counts 25/25/20/20/10.
- One-question navigation on the long form, saved position/answers/flags, next-unanswered and next-flagged actions, answer clearing, persistent deadline, delayed feedback, domain results and a downloadable attempt for review.
- Previous pilot exposure carries into the full form. Older pending pilot sessions continue to load; their deadline and answers remain intact. Historical records now preserve up to 100 per-item responses rather than truncating at 20.
- A concrete technical-review and learner-validation protocol in EXAM-VALIDATION.md. No hosting or Firebase work was undertaken.

## Critique and remaining limitations

The full-session form is **not validated**. A hundred questions and a two-hour clock do not establish fairness, calibration, comprehensive subobjective coverage or prediction of certification performance. The earlier pilot questions are mostly introductory and some distractors are weak; all items need independent review and representative learner testing. There are no performance-based exam tasks or calibrated passing threshold. The item count and format are our product choices, not a reproduction of Cisco's actual exam.

The external recipes are not executed .pkt projects. Simulator/device support must be checked and observed results recorded on named versions. Browser trainers verify only their explicitly stated small models; they cannot verify a real topology or prove a learner's written reasoning. Additional practical depth is still needed for wireless, physical media faults, FHRP, AAA, VPNs, Layer 2 protection, monitoring and automation.

## Software validation

Unit checks cover 100-item domain/objective distribution, option permutations, scoring including fourth-option keys, exposure migration, invalid sessions, all-response retention, bounded-model failure/success cases, and the existing storage/lab behaviors. Browser checks cover desktop and narrow layouts, trainer verification after changes, long-form navigation/flags/clearing/resume, delayed feedback and export. These checks validate implemented software behavior, not the educational claims listed above.
