import { defineCard } from "../define.js";

// EDHREC rank 23016.
const MONSTROSITY_TEXT =
  "{5}{B}{B}: Monstrosity 1. (If this creature isn't monstrous, put a +1/+1 counter on it and it becomes monstrous.)";
const MONSTROUS_TEXT = "When this creature becomes monstrous, destroy target non-Gorgon creature an opponent controls.";

export default defineCard({
  name: "Keepsake Gorgon",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Gorgon"],
  power: 2,
  toughness: 5,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${MONSTROSITY_TEXT}\n${MONSTROUS_TEXT}`,
  activated: [
    {
      cost: { mana: "{5}{B}{B}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 1 },
      resolve: null,
      text: MONSTROSITY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-monstrous", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", notSubtypes: ["Gorgon"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: MONSTROUS_TEXT,
    },
  ],
});
