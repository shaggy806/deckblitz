import { defineCard } from "../define.js";

// The division is announced as it's cast (rule 601.2d), at least 1 to each
// target, of 2 — or of X when cast for its madness cost (702.35b), whose X
// is announced first (601.2b): so no more targets than the total. A target
// gone illegal loses its share (its ruling).
export default defineCard({
  name: "Avacyn's Judgment",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Madness {X}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)\nAvacyn's Judgment deals 2 damage divided as you choose among any number of targets. If this spell's madness cost was paid, it deals X damage divided as you choose among those permanents and/or players instead.",
  madness: { cost: "{X}{R}" },
  targets: [{ kind: "any-number", of: "any-target" }],
  divided: {
    total: { ifCondition: { kind: "self-alternative-cost-paid", madness: true }, then: "x", else: 2 },
    slot: 0,
  },
  effect: { kind: "damage-divided", from: 0 },
});
