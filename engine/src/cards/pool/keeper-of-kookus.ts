import { defineCard } from "../define.js";

// EDHREC rank 29138.

export default defineCard({
  name: "Keeper of Kookus",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  text: "{R}: This creature gains protection from red until end of turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: {
        kind: "grant-protection",
        target: "source",
        from: { colors: ["R"] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{R}: This creature gains protection from red until end of turn.",
    },
  ],
});
