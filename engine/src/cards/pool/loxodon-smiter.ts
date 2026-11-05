import { defineCard } from "../define.js";

// EDHREC rank 23423.

export default defineCard({
  name: "Loxodon Smiter",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elephant", "Soldier"],
  power: 4,
  toughness: 4,
  cantBeCountered: true,
  discardedByOpponentEnters: {},
  text: "This spell can't be countered.\nIf a spell or ability an opponent controls causes you to discard this card, put it onto the battlefield instead of putting it into your graveyard.",
});
