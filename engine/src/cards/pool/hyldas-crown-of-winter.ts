import { defineCard } from "../define.js";

const TAP = "{1}, {T}: Tap target creature. This ability costs {1} less to activate during your turn.";
const DRAW = "{3}, Sacrifice Hylda's Crown of Winter: Draw a card for each tapped creature your opponents control.";

export default defineCard({
  name: "Hylda's Crown of Winter",
  manaCost: "{3}",
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${TAP}\n${DRAW}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      costReduction: { reduceGeneric: 1, condition: { kind: "your-turn" } },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TAP,
    },
    {
      cost: { mana: "{3}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "draw",
        amount: { countOf: { type: "creature", tapped: true, controlledBy: "opponent" } },
      },
      resolve: null,
      text: DRAW,
    },
  ],
});
