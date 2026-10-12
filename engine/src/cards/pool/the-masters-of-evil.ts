import { defineCard } from "../define.js";

// EDHREC rank 15342. Marvel Super Heroes. The Squadron Sinister's lord, and
// Altanak's "Discard this card" ability from the hand (`zone: "hand"`: the
// card is discarded as the cost). Expedition Map's search to the hand.

const LORD_TEXT = "Other Villains you control get +2/+1.";
const SEARCH_TEXT =
  "{1}{B}, Discard this card: Search your library for a Plan card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "The Masters of Evil",
  manaCost: "{5}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 5,
  toughness: 6,
  text: `${LORD_TEXT}\n${SEARCH_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Villain", controlledBy: "you" }, excludeSelf: true },
      grantPt: [2, 1],
      text: LORD_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtype: "Plan" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: SEARCH_TEXT,
      zone: "hand",
    },
  ],
});
