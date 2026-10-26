import { defineCard } from "../define.js";

// EDHREC rank 28374. Wave Elemental's "up to three target
// creatures without flying".

const NO_FLYING = { kind: "permanent", filter: { type: "creature", notKeyword: "flying" } } as const;

export default defineCard({
  name: "Tidal Surge",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Tap up to three target creatures without flying.",
  targets: [
    { kind: "optional", of: NO_FLYING },
    { kind: "optional", of: { kind: "other", of: NO_FLYING, than: { slot: 0 } } },
    { kind: "optional", of: { kind: "other", of: NO_FLYING, than: { slots: [0, 1] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "tap", target: 1 },
      { kind: "tap", target: 2 },
    ],
  },
});
