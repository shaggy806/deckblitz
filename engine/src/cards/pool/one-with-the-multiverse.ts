import { defineCard } from "../define.js";

const LOOK_TEXT = "You may look at the top card of your library any time.";
const PLAY_TEXT = "You may play lands and cast spells from the top of your library.";
const FREE_TEXT = "Once during each of your turns, you may cast a spell from your hand or the top of your library without paying its mana cost.";

export default defineCard({
  name: "One with the Multiverse",
  manaCost: "{6}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  looksAtOwnLibraryTop: true,
  text: `${LOOK_TEXT}\n${PLAY_TEXT}\n${FREE_TEXT}`,
  static: [
    { affects: { scope: "self" }, playFromLibraryTop: { type: "land" }, castFromLibraryTop: { filter: {} }, text: PLAY_TEXT },
    {
      affects: { scope: "self" },
      alternativeCostForSpells: {
        mana: "{0}",
        oncePerTurn: true,
        yourTurnOnly: true,
        fromHand: true,
        fromZones: ["library"],
      },
      text: FREE_TEXT,
    },
  ],
});
