import { defineCard } from "../define.js";

// EDHREC rank 10395.

export default defineCard({
  name: "Tireless Tribe",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Nomad"],
  power: 1,
  toughness: 1,
  text: "Discard a card: This creature gets +0/+4 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 0, toughness: 4, duration: "end-of-turn" },
      resolve: null,
      text: "Discard a card: This creature gets +0/+4 until end of turn.",
    },
  ],
});
