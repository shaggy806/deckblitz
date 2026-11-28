import { defineCard } from "../define.js";

const TEXT = "{T}, Untap a tapped land an opponent controls: Add one mana of any type that land could produce.";

// A mana ability (rule 605.1a) activated by hand: the land is named with the
// type, and what it could produce is rule 106.7's, its costs ignored.
export default defineCard({
  name: "Benthic Explorers",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout"],
  power: 2,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        untapOthers: { count: 1, filter: { type: "land", controlledBy: "opponent" } },
      },
      targets: [],
      effect: { kind: "add-mana", mana: { untappedCouldProduce: { type: "land", controlledBy: "opponent" } }, amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
