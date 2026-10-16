import { defineCard } from "../define.js";

// EDHREC rank 12896.
const ENTER =
  "When this creature enters, destroy target creature an opponent controls that was dealt damage this turn.";

export default defineCard({
  name: "Rooftop Assassin",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Assassin"],
  power: 2,
  toughness: 2,
  keywords: ["flash", "flying", "lifelink"],
  text: `Flash\nFlying, lifelink\n${ENTER}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", damagedThisTurnBy: {} } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ENTER,
    },
  ],
});
