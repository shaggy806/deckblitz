import { defineCard } from "../define.js";

// Rulings:
//   [2008-04-01] The ability cares whether a creature has been dealt damage, not whether it still
//     has damage on it. You can target a creature that was damaged and regenerated.
//   [2008-04-01] The effect is mandatory. If you control the only creature that's been dealt
//     damage this turn, you must target that creature.

const TRIGGER_TEXT = "When this creature enters, destroy target creature that was dealt damage this turn.";

export default defineCard({
  name: "Final-Sting Faerie",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Faerie", "Assassin"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", damagedThisTurnBy: {} } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
