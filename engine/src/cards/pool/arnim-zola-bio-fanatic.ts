import { defineCard } from "../define.js";

// EDHREC rank 19953.
// Makes Villain → "Villain Token".
//
// The two creature cards are counted as the ability is activated (Tomb
// Tyrant's `cards-in-graveyard` condition), before its costs are paid.
const TOKEN_TEXT =
  "{3}, {T}: Create a tapped 2/1 black Villain creature token with menace. Activate only if there are two or more creature cards in your graveyard.";

export default defineCard({
  name: "Arnim Zola, Bio-Fanatic",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Scientist", "Villain"],
  power: 2,
  toughness: 3,
  text: `${TOKEN_TEXT} (It can't be blocked except by two or more creatures.)`,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Villain Token", count: 1, tapped: true },
      resolve: null,
      condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { type: "creature" } },
      text: TOKEN_TEXT,
    },
  ],
});
