import { defineCard } from "../define.js";

export default defineCard({
  name: "Burning-Fist Minotaur",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Wizard"],
  power: 2,
  toughness: 1,
  keywords: ["first-strike"],
  text: "First strike\n{1}{R}, Discard a card: This creature gets +2/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{R}, Discard a card: This creature gets +2/+0 until end of turn.",
    },
  ],
});
