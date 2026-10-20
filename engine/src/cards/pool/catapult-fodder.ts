import { defineCard } from "../define.js";

// An intervening-if (rule 603.4), checked as it triggers and as it resolves.
// Each of the three creatures must have toughness greater than its own power
// (the ruling) — the `own` operand; Catapult Fodder itself counts.
const TEXT =
  "At the beginning of combat on your turn, if you control three or more creatures that each have toughness greater than their power, transform this creature.";

export default defineCard({
  name: "Catapult Fodder",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: {
        kind: "controls",
        filter: { type: "creature", toughness: { op: "gt", n: { own: "power" } } },
        atLeast: 3,
      },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Catapult Fodder", "Catapult Captain"],
  transform: true,
});
