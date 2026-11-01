import { defineCard } from "../define.js";

// EDHREC rank 5937. "For the first time each turn" is the turn's first
// discard event, read off the turn's history: a discard earlier in the turn,
// before Rielle was on the battlefield, was the first, so a later one doesn't
// trigger it. "That many" is how many cards that first discard discarded.

const STATIC = "Rielle gets +1/+0 for each instant and sorcery card in your graveyard.";
const DISCARD = "Whenever you discard one or more cards for the first time each turn, draw that many cards.";

export default defineCard({
  name: "Rielle, the Everwise",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 3,
  text: `${STATIC}\n${DISCARD}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { inGraveyard: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" }, pt: [1, 0] },
      text: STATIC,
    },
  ],
  triggered: [
    {
      trigger: { on: "discards", who: "you", firstTimeEachTurn: true },
      targets: [],
      effect: { kind: "draw", amount: { triggerValue: true } },
      resolve: null,
      text: DISCARD,
    },
  ],
});
