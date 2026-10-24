import { defineCard } from "../define.js";

// EDHREC rank 25166.

export default defineCard({
  name: "Kytheon's Irregulars",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 3,
  text: "Renown 1 (When this creature deals combat damage to a player, if it isn't renowned, put a +1/+1 counter on it and it becomes renowned.)\n{W}{W}: Tap target creature.",
  activated: [
    {
      cost: { mana: "{W}{W}", tap: false },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{W}{W}: Tap target creature.",
    },
  ],
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
