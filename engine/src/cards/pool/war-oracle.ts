import { defineCard } from "../define.js";

// EDHREC rank 28886.

export default defineCard({
  name: "War Oracle",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 3,
  keywords: ["lifelink"],
  text: "Lifelink (Damage dealt by this creature also causes you to gain that much life.)\nRenown 1 (When this creature deals combat damage to a player, if it isn't renowned, put a +1/+1 counter on it and it becomes renowned.)",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: { kind: "source", filter: { renowned: false } },
      targets: [],
      effect: { kind: "renown", amount: 1 },
      resolve: null,
      text: "Renown 1 (When this creature deals combat damage to a player, if it isn't renowned, put a +1/+1 counter on it and it becomes renowned.)",
    },
  ],
});
