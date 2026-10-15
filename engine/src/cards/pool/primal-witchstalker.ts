import { defineCard } from "../define.js";

// EDHREC rank 22367.
//
// "When you do" is a reflexive ability (rule 603.12) that triggers only when
// all four cards were milled: Wick's Patrol's ruling — with three or fewer
// cards in the library you mill what you can, but it doesn't trigger. Its
// target is chosen once the milled cards are in the graveyard, so a land
// milled this way can be the one returned.
const ENTERS_TEXT =
  "When this creature enters, mill four cards. When you do, return target land card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Primal Witchstalker",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 1,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nWhen this creature enters, mill four cards. When you do, return target land card from your graveyard to the battlefield tapped. (To mill four cards, put the top four cards of your library into your graveyard.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 4 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "milled", atLeast: 4 },
            then: {
              kind: "reflexive-trigger",
              targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "land" } }],
              effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
              text: "When you do, return target land card from your graveyard to the battlefield tapped.",
            },
          },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
