import { defineCard } from "../define.js";

// Magic Origins. EDHREC rank 19770.
//
// Rulings:
//   [2015-06-22] Each creature you control that becomes blocked gets +1/+1, however many
//     creatures block it.
//
// Tattered Ratter's trigger over every creature you control: once per
// creature that becomes blocked, "it" the blocked creature.
const BLOCKED_TEXT = "Whenever a creature you control becomes blocked, it gets +1/+1 until end of turn.";
const TRAMPLE_TEXT = "{1}{G}: Target creature you control gains trample until end of turn.";

export default defineCard({
  name: "Somberwald Alpha",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 3,
  toughness: 2,
  text: `${BLOCKED_TEXT}\n${TRAMPLE_TEXT} (It can deal excess combat damage to the player or planeswalker it's attacking.)`,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: BLOCKED_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      resolve: null,
      text: TRAMPLE_TEXT,
    },
  ],
});
