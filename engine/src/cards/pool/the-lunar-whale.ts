import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 10930.
//
// Rulings:
//   [2025-06-06] You must follow all normal timing rules for spells cast and lands played using
//     the third ability and must pay all costs for spells cast this way.
//   [2025-06-06] The top card of your library isn't in your hand, so you can't cycle it, discard
//     it, or activate any of its abilities that could be activated from your hand.
//   [2025-06-06] The Lunar Whale lets you look at the top card of your library whenever you want.
//
// Crystal Skull, Isu Spyglass's look-and-play shape, the play permission
// gated on the Whale having attacked this turn (`attackedThisTurn`, read off
// the Whale itself, so a Whale that left and came back hasn't).
const LOOK_TEXT = "You may look at the top card of your library any time.";
const PLAY_TEXT = "As long as The Lunar Whale attacked this turn, you may play the top card of your library.";

export default defineCard({
  name: "The Lunar Whale",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${LOOK_TEXT}\n${PLAY_TEXT}\nCrew 1`,
  looksAtOwnLibraryTop: true,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attackedThisTurn: true } },
      playFromLibraryTop: { type: "land" },
      castFromLibraryTop: { filter: {} },
      text: PLAY_TEXT,
    },
  ],
  activated: [crew(1)],
});
