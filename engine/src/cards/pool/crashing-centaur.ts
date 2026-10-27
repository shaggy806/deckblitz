import { defineCard } from "../define.js";

// EDHREC rank 31611.

const TRAMPLE_TEXT = "{G}, Discard a card: This creature gains trample until end of turn.";
const THRESHOLD_TEXT =
  "Threshold — As long as there are seven or more cards in your graveyard, this creature gets +2/+2 and has shroud. (It can't be the target of spells or abilities.)";

export default defineCard({
  name: "Crashing Centaur",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur"],
  power: 3,
  toughness: 4,
  text: `${TRAMPLE_TEXT}\n${THRESHOLD_TEXT}`,
  activated: [
    {
      cost: { mana: "{G}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
      resolve: null,
      text: TRAMPLE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [2, 2],
      grantKeywords: ["shroud"],
      text: THRESHOLD_TEXT,
    },
  ],
});
