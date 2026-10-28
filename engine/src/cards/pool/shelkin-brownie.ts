import { defineCard } from "../define.js";

// EDHREC rank 31433.

export default defineCard({
  name: "Shelkin Brownie",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ouphe"],
  power: 1,
  toughness: 1,
  text: "{T}: Target creature loses all \"bands with other\" abilities until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "lose-keywords",
        target: 0,
        keywords: ["bands-with-other"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{T}: Target creature loses all \"bands with other\" abilities until end of turn.",
    },
  ],
});
