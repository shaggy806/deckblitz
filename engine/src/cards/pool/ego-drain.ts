import { defineCard } from "../define.js";

// EDHREC rank 18542.
//
// Cerebral Confiscation's Duress-style discard, then "if you don't control a
// Faerie" asked as the spell resolves (rule 608.2c): its caster picks a card
// of their own hand and exiles it — Heated Argument's `look-and-choose` into
// exile, from the hand. One card if they have any; none with an empty hand.

export default defineCard({
  name: "Ego Drain",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a nonland card from it. That player discards that card. If you don't control a Faerie, exile a card from your hand.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
      {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Faerie" }, atLeast: 1 } },
        then: { kind: "look-and-choose", zone: "hand", min: 1, max: 1, destination: "exile", leftover: "stay" },
      },
    ],
  },
});
