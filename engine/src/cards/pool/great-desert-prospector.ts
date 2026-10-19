import { defineCard } from "../define.js";

// EDHREC rank 18919. The Brothers' War.
// Rulings:
//   Although all the cards in The Brothers' War that create Powerstone tokens create a tapped
//   Powerstone token, entering the battlefield tapped isn't part of the token's definition.

const ENTER_TEXT =
  "When this creature enters, create a tapped Powerstone token for each other creature you control.";

export default defineCard({
  name: "Great Desert Prospector",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 2,
  text: `${ENTER_TEXT} (They're artifacts with "{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.")`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Counted as it resolves.
      effect: {
        kind: "create-token",
        token: "Powerstone Token",
        count: { countOf: { type: "creature", controlledBy: "you" }, excludeSelf: true },
        tapped: true,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
