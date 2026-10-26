import { defineCard } from "../define.js";

export default defineCard({
  name: "Canyon Drake",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\n{1}, Discard a card at random: This creature gets +2/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, discard: { count: 1, random: true } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}, Discard a card at random: This creature gets +2/+0 until end of turn.",
    },
  ],
});
