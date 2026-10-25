import { defineCard } from "../define.js";

// Mirage. EDHREC rank 17154.

export default defineCard({
  name: "Jolt",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "You may tap or untap target artifact, creature, or land.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "land"] } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap it", effect: { kind: "tap", target: 0 } },
          { text: "Untap it", effect: { kind: "untap", target: 0 } },
        ],
      },
      { kind: "delayed-trigger", at: "next-upkeep", effect: { kind: "draw", amount: 1 }, text: "Draw a card." },
    ],
  },
});
