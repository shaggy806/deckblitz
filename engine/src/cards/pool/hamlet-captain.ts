import { defineCard } from "../define.js";

const TEXT = "Whenever this creature attacks or blocks, other Humans you control get +1/+1 until end of turn.";
const EFFECT = {
  kind: "modify-pt-all",
  filter: { type: "creature", subtype: "Human", controlledBy: "you" },
  power: 1,
  toughness: 1,
  duration: "end-of-turn",
  exceptSource: true,
} as const;

export default defineCard({
  name: "Hamlet Captain",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
  ],
});
