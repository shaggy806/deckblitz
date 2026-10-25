import { defineCard } from "../define.js";

// EDHREC rank 23218. Devoid: no colors.

export default defineCard({
  name: "Sludge Crawler",
  manaCost: "{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 1,
  toughness: 1,
  text: "Devoid (This card has no color.)\nIngest (Whenever this creature deals combat damage to a player, that player exiles the top card of their library.)\n{2}: This creature gets +1/+1 until end of turn.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "exile-from-library", whose: "trigger-player", amount: 1 },
      resolve: null,
      text: "Ingest",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{2}: This creature gets +1/+1 until end of turn.",
    },
  ],
});
