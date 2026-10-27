import { defineCard } from "../define.js";

// EDHREC rank 30584.

export default defineCard({
  name: "Dwarven Strike Force",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Berserker"],
  power: 4,
  toughness: 3,
  text: "Discard a card at random: This creature gains first strike and haste until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1, random: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "grant-keyword",
            target: "source",
            keyword: "first-strike",
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword",
            target: "source",
            keyword: "haste",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "Discard a card at random: This creature gains first strike and haste until end of turn.",
    },
  ],
});
