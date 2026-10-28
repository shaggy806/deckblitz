import { defineCard } from "../define.js";

// EDHREC rank 27947.

export default defineCard({
  name: "Hell-Bent Raider",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Barbarian"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike", "haste"],
  text: "First strike, haste\nDiscard a card at random: This creature gains protection from white until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1, random: true } },
      targets: [],
      effect: {
        kind: "grant-protection",
        target: "source",
        from: { colors: ["W"] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Discard a card at random: This creature gains protection from white until end of turn.",
    },
  ],
});
