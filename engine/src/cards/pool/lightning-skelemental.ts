import { defineCard } from "../define.js";

// EDHREC rank 10531.

const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player, that player discards two cards.";
const END_TEXT = "At the beginning of the end step, sacrifice this creature.";

export default defineCard({
  name: "Lightning Skelemental",
  manaCost: "{B}{R}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Elemental", "Skeleton"],
  power: 6,
  toughness: 1,
  keywords: ["trample", "haste"],
  text: `Trample, haste\n${DAMAGE_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 2 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
