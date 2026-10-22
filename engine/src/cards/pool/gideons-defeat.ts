import { defineCard } from "../define.js";

// EDHREC rank 28086. "If it was a Gideon planeswalker" reads the exiled
// creature as it last existed on the battlefield (Brackish Blunder's "if it
// was tapped").

export default defineCard({
  name: "Gideon's Defeat",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target white creature that's attacking or blocking. If it was a Gideon planeswalker, you gain 5 life.",
  targets: [
    {
      kind: "permanent",
      whose: "any",
      filter: { type: "creature", colors: ["W"], anyOf: [{ attacking: true }, { blocking: true }] },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { type: "planeswalker", subtype: "Gideon" } },
        then: { kind: "gain-life", amount: 5 },
      },
    ],
  },
});
