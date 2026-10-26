import { defineCard } from "../define.js";

export default defineCard({
  name: "New Prahv Guildmage",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{W}{U}: Target creature gains flying until end of turn.\n{3}{W}{U}: Detain target nonland permanent an opponent controls. (Until your next turn, that permanent can't attack or block and its activated abilities can't be activated.)",
  activated: [
    {
      cost: { mana: "{W}{U}", tap: false },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{W}{U}: Target creature gains flying until end of turn.",
    },
    {
      cost: { mana: "{3}{W}{U}", tap: false },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: { kind: "detain", target: 0 },
      resolve: null,
      text: "{3}{W}{U}: Detain target nonland permanent an opponent controls.",
    },
  ],
});
