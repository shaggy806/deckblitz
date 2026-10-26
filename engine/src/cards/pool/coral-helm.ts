import { defineCard } from "../define.js";

export default defineCard({
  name: "Coral Helm",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{3}, Discard a card at random: Target creature gets +2/+2 until end of turn.",
  activated: [
    {
      cost: { mana: "{3}", tap: false, discard: { count: 1, random: true } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{3}, Discard a card at random: Target creature gets +2/+2 until end of turn.",
    },
  ],
});
