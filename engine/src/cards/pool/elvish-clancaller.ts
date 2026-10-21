import { defineCard } from "../define.js";

// EDHREC rank 14168.

const LORD_TEXT = "Other Elves you control get +1/+1.";
const SEARCH_TEXT =
  "{4}{G}{G}, {T}: Search your library for a card named Elvish Clancaller, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Elvish Clancaller",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 1,
  toughness: 1,
  text: `${LORD_TEXT}\n${SEARCH_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Elf" },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{G}{G}", tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { name: "Elvish Clancaller" },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
});
