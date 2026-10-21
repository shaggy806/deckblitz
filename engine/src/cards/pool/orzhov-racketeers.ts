import { defineCard } from "../define.js";

// EDHREC rank 25815.
// Makes Spirit → use "Spirit Token (White-Black)".
const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player, that player discards a card.";
const AFTERLIFE_TEXT =
  "Afterlife 2 (When this creature dies, create two 1/1 white and black Spirit creature tokens with flying.)";

export default defineCard({
  name: "Orzhov Racketeers",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 2,
  text: `${DAMAGE_TEXT}\n${AFTERLIFE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (White-Black)", count: 2 },
      resolve: null,
      text: AFTERLIFE_TEXT,
    },
  ],
});
