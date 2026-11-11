import { defineCard } from "../define.js";

// EDHREC rank 5820. "A creature card was put into your graveyard from anywhere
// this turn" is Cloakwood Hermit's condition: the journal's `descended`, each
// card as it arrived (a token isn't a card).
const LORD_TEXT = "Other Demons, Devils, Imps, and Tieflings you control get +1/+1 and have lifelink.";
const END_TEXT =
  'At the beginning of each end step, if a creature card was put into your graveyard from anywhere this turn, create a 1/1 red Devil creature token with "When this token dies, it deals 1 damage to any target."';

export default defineCard({
  name: "Raphael, Fiendish Savior",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Devil", "Noble"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${LORD_TEXT}\n${END_TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { subtypes: ["Demon", "Devil", "Imp", "Tiefling"], controlledBy: "you" },
        excludeSelf: true,
      },
      grantPt: [1, 1],
      grantKeywords: ["lifelink"],
      text: LORD_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-history", what: "descended", filter: { type: "creature", token: false } },
      targets: [],
      effect: { kind: "create-token", token: "Devil Token", count: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
