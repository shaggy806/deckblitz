import { defineCard } from "../define.js";

// EDHREC rank 25777.

export default defineCard({
  name: "Knight of Dawn",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike\n{W}{W}: This creature gains protection from the color of your choice until end of turn.",
  activated: [
    {
      cost: { mana: "{W}{W}", tap: false },
      targets: [],
      effect: {
        kind: "grant-protection",
        target: "source",
        from: { choose: "color" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{W}{W}: This creature gains protection from the color of your choice until end of turn.",
    },
  ],
});
