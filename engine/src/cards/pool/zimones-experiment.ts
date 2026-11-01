import { defineCard } from "../define.js";

// One choice over the top five, and each card taken goes by what it is: the
// land instruction comes first (rule 608.2c), so a land creature is already on
// the battlefield when "all creature cards" is read. Only the cards taken are
// revealed.
const TEXT =
  "Look at the top five cards of your library. You may reveal up to two creature and/or land cards from among them, " +
  "then put the rest on the bottom of your library in a random order. Put all land cards revealed this way onto the " +
  "battlefield tapped and put all creature cards revealed this way into your hand.";

export default defineCard({
  name: "Zimone's Experiment",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 5,
    reveal: "chosen",
    min: 0,
    max: 2,
    filter: { typesAnyOf: ["creature", "land"] },
    destination: "hand",
    split: [
      { label: "land cards", filter: { type: "land" }, destination: "battlefield", enterTapped: true },
      { label: "creature cards", filter: { type: "creature" }, destination: "hand" },
    ],
    leftover: "bottom-random",
  },
});
