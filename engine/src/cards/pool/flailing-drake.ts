import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 32263.
//
// One ability with two trigger events (`sameAbilityAs` — Aisling
// Leprechaun's shape): the creature it blocks, or each creature blocking it,
// gets +1/+1 until end of turn.

const TEXT =
  "Whenever this creature blocks or becomes blocked by a creature, that creature gets +1/+1 until end of turn.";
const PUMP = {
  kind: "modify-pt",
  target: "trigger-object",
  power: 1,
  toughness: 1,
  duration: "end-of-turn",
} as const;

export default defineCard({
  name: "Flailing Drake",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: PUMP,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: PUMP,
      resolve: null,
      text: TEXT,
    },
  ],
});
