import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 12049.
//
// The change of control removes it from combat (rule 506.4), which the
// engine does on any control change.

const TEXT =
  "Whenever this creature blocks or becomes blocked, target opponent gains control of it. (This removes this creature from combat.)";
const DEFECT = { kind: "gain-control", target: "source", who: { target: 0 }, untilEndOfTurn: false } as const;

export default defineCard({
  name: "Goblin Cadets",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      sameAbilityAs: 1,
      targets: ["opponent"],
      effect: DEFECT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "becomes-blocked", who: "self" },
      sameAbilityAs: 0,
      targets: ["opponent"],
      effect: DEFECT,
      resolve: null,
      text: TEXT,
    },
  ],
});
