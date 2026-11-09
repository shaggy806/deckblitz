import { defineCard } from "../define.js";

// Basic takes those lands out of a "nonbasic lands" effect's reach, whatever
// the timestamps (rule 613.8a), and a search for a basic land card can find any
// land card in your library; it gives no land type or ability (the rulings).

const TEXT = "Lands you control and land cards in your library are basic.";

export default defineCard({
  name: "Rootpath Purifier",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 3,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "land", controlledBy: "you" } },
      addSupertypes: ["basic"],
      outsideBattlefield: { ofType: ["land"], zones: ["library"], addSupertypes: ["basic"] },
      text: TEXT,
    },
  ],
});
