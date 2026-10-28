import { defineCard } from "../define.js";

// EDHREC rank 27632.

export default defineCard({
  name: "Rappelling Scouts",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Scout"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\n{2}{W}: This creature gains protection from the color of your choice until end of turn.",
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [],
      effect: {
        kind: "grant-protection",
        target: "source",
        from: { choose: "color" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{2}{W}: This creature gains protection from the color of your choice until end of turn.",
    },
  ],
});
