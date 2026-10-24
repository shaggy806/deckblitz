import { defineCard } from "../define.js";

// EDHREC rank 20550. Devoid: no colors, so on the battlefield it counts
// itself (the ruling).

const POWER_TEXT = "Vile Aggregate's power is equal to the number of colorless creatures you control.";

export default defineCard({
  name: "Vile Aggregate",
  manaCost: "{2}{R}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 0,
  toughness: 5,
  keywords: ["trample"],
  text: `Devoid (This card has no color.)\n${POWER_TEXT}\nTrample\nIngest (Whenever this creature deals combat damage to a player, that player exiles the top card of their library.)`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", colorless: true, controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "exile-from-library", whose: "trigger-player", amount: 1 },
      resolve: null,
      text: "Ingest",
    },
  ],
});
