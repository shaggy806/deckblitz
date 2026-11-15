import { defineCard } from "../define.js";
import type { CardFilter } from "../../filter.js";

// EDHREC rank 26656.

const TEXT =
  "Once during each of your turns, you may play a permanent card you own from outside the game or from your graveyard.";

// One play a turn between the two zones (`oncePerTurn` counts every play
// this source gives). Outside the game is its owner's sideboard (rule
// 400.11a): none in a Commander game (903.5e), so there it's the graveyard.
const PERMANENT_CARD: CardFilter = {
  typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
};

export default defineCard({
  name: "The Holodeck",
  manaCost: "{7}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      mayPlay: { from: "graveyard", play: true, filter: PERMANENT_CARD, oncePerTurn: true, yourTurnOnly: true },
      text: TEXT,
    },
    {
      affects: { scope: "self" },
      mayPlay: { from: "outside", play: true, filter: PERMANENT_CARD, oncePerTurn: true, yourTurnOnly: true },
      text: TEXT,
    },
  ],
});
