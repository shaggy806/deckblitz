import { defineCard } from "../define.js";

// Doctor Who (WHO). EDHREC rank 12567.
//
// X counts the attacking artifact creatures — Cybermat among them — as the
// trigger resolves, and stays fixed for the turn.

const TEXT =
  "Whenever this creature attacks and isn't blocked, it gets +X/+0 until end of turn, where X is the number of attacking artifact creatures.";

export default defineCard({
  name: "Cybermat",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 2,
  toughness: 1,
  keywords: ["skulk"],
  text: `Skulk (This creature can't be blocked by creatures with greater power.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { types: ["artifact", "creature"], attacking: true } },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
