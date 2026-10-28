import { defineCard } from "../define.js";

// EDHREC rank 6029.

export default defineCard({
  name: "Benevolent Bodyguard",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: "Sacrifice this creature: Target creature you control gains protection from the color of your choice until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "grant-protection",
        target: 0,
        from: { choose: "color" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Sacrifice this creature: Target creature you control gains protection from the color of your choice until end of turn.",
    },
  ],
});
