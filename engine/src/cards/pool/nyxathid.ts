import { defineCard } from "../define.js";

// Conflux. A layer-7c bonus read from the chosen opponent's side, live as
// their hand changes.

const CHOOSE = "As this creature enters, choose an opponent.";
const SHRINK = "This creature gets -1/-1 for each card in the chosen player's hand.";

export default defineCard({
  name: "Nyxathid",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 7,
  toughness: 7,
  text: `${CHOOSE}\n${SHRINK}`,
  choosePlayerOnEnter: "opponent",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { cardsInHand: true, forChosenPlayer: true, pt: [-1, -1] },
      text: SHRINK,
    },
  ],
});
