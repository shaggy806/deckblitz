import { defineCard } from "../define.js";

// EDHREC rank 28841.

export default defineCard({
  name: "Armored Guardian",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Cat", "Soldier"],
  power: 2,
  toughness: 5,
  text: "{1}{W}{W}: Target creature you control gains protection from the color of your choice until end of turn.\n{1}{U}{U}: This creature gains shroud until end of turn. (It can't be the target of spells or abilities.)",
  activated: [
    {
      cost: { mana: "{1}{W}{W}", tap: false },
      targets: ["creature-you-control"],
      effect: {
        kind: "grant-protection",
        target: 0,
        from: { choose: "color" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{1}{W}{W}: Target creature you control gains protection from the color of your choice until end of turn.",
    },
    {
      cost: { mana: "{1}{U}{U}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "shroud", duration: "end-of-turn" },
      resolve: null,
      text: "{1}{U}{U}: This creature gains shroud until end of turn.",
    },
  ],
});
