import { defineCard } from "../define.js";

// EDHREC rank 10227.
//
// Rulings:
//   [2011-09-22] Although the tokens are attacking, they were never declared as attacking
//     creatures (for purposes of abilities that trigger whenever a creature attacks, for example).
//   [2011-09-22] You count the number of creature cards in your graveyard when the triggered
//     ability resolves.
//   [2011-09-22] You declare which player or planeswalker each token is attacking as you put it
//     onto the battlefield. It doesn't have to be the same player or planeswalker Kessig
//     Cagebreakers is attacking.
//
// The count is read as the trigger resolves; `attacking: "choose"` asks for
// each token what it attacks (rule 508.4).

const TRIGGER =
  "Whenever this creature attacks, create a 2/2 green Wolf creature token that's tapped and attacking for each creature card in your graveyard.";

export default defineCard({
  name: "Kessig Cagebreakers",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 4,
  text: TRIGGER,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Wolf Token",
        count: { countInGraveyard: { type: "creature", ownedBy: "you" } },
        tapped: true,
        attacking: "choose",
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
