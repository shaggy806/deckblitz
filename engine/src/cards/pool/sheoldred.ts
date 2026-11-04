import { defineCard } from "../define.js";

// EDHREC rank 2008. Transforms into The True Scriptures.
//
// Rulings:
//   You can activate Sheoldred's last ability if any opponent has eight or more cards in their
//   graveyard, not necessarily all of them. Once you've activated it, it doesn't matter what
//   happens to the number of cards in opponents' graveyards.
const ENTERS_TEXT = "When Sheoldred enters, each opponent sacrifices a nontoken creature or planeswalker of their choice.";
const FLIP_TEXT =
  "{4}{B}: Exile Sheoldred, then return it to the battlefield transformed under its owner's control. " +
  "Activate only as a sorcery and only if an opponent has eight or more cards in their graveyard.";

export default defineCard({
  name: "Sheoldred",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Praetor"],
  power: 4,
  toughness: 5,
  keywords: ["menace"],
  text: `Menace\n${ENTERS_TEXT}\n${FLIP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sacrifice",
        who: "each-opponent",
        filter: { token: false, typesAnyOf: ["creature", "planeswalker"] },
        count: 1,
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{B}", tap: false },
      sorcerySpeed: true,
      condition: { kind: "cards-in-graveyard", whose: "an-opponent", atLeast: 8 },
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true },
      resolve: null,
      text: FLIP_TEXT,
    },
  ],
  faces: ["Sheoldred", "The True Scriptures"],
  transform: true,
});
