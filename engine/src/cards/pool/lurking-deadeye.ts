import { defineCard } from "../define.js";

// EDHREC rank 24117. Ikoria: Lair of Behemoths.
const TRIGGER_TEXT = "When this creature enters, destroy target creature that was dealt damage this turn.";

export default defineCard({
  name: "Lurking Deadeye",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 4,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${TRIGGER_TEXT}`,
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
