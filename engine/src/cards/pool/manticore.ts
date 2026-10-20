import { defineCard } from "../define.js";

const TAIL_TEXT =
  "Tail Spikes — When this creature enters, destroy target creature an opponent controls that was dealt damage this turn.";

export default defineCard({
  name: "Manticore",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Manticore"],
  power: 2,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${TAIL_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", damagedThisTurnBy: {} } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TAIL_TEXT,
    },
  ],
});
