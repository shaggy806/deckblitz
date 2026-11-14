import { defineCard } from "../define.js";

// EDHREC rank 26518. Unfinity. The Attraction slot is bound to the targeted
// opponent (`sameController` with slot 0, a player slot's player being that
// player — Goblin Welder's shape); each target is checked on its own as the
// spell resolves (the ruling). A destroyed Attraction card goes to its
// owner's junkyard, which the engine does from the definition (a copy of one
// goes to a graveyard — the other ruling).
export default defineCard({
  name: "Down for Repairs",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a nonland card from it. That player discards that card. Destroy up to one target Attraction that player controls. (It's put into their junkyard.)",
  targets: [
    "opponent",
    {
      kind: "optional",
      of: {
        kind: "other",
        of: { kind: "permanent", filter: { subtype: "Attraction" } },
        than: { slots: [0] },
        sameController: true,
      },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
      { kind: "destroy", target: 1 },
    ],
  },
});
