import { defineCard } from "../define.js";

// EDHREC rank 9403.
//
// Massacre Wurm's shape: "that player" is the dying creature's controller.
const CHAINSWORD_TEXT = "Chainsword — Whenever a creature an opponent controls dies, that player loses 2 life.";

export default defineCard({
  name: "Assault Intercessor",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Astartes", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["first-strike", "menace"],
  text: `First strike, menace\n${CHAINSWORD_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: CHAINSWORD_TEXT,
    },
  ],
});
