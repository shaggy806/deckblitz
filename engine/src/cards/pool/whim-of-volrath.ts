import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 11380.
//
// Rulings:
//   It can't change a word to the same word. It must be a different word.
//   It only changes what is printed on the card (or set on a token when it was created or set by a
//     copy effect). It will not change any effects that are on the permanent.
//   You choose the words to change on resolution.
//
// Mind Bend's text change for the turn (`duration: "end-of-turn"`, Crystal Spray's): a token one
// of its changed abilities creates is the changed colour (rule 612.4, `tokenTextChanges`).

export default defineCard({
  name: "Whim of Volrath",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  kicker: { cost: "{2}", keyword: "buyback" },
  text:
    "Buyback {2} (You may pay an additional {2} as you cast this spell. If you do, put this card into your hand as it resolves.)\n" +
    'Change the text of target permanent by replacing all instances of one color word with another or one basic land type with another until end of turn. (For example, you may change "nonred creature" to "nongreen creature" or "plainswalk" to "swampwalk.")',
  targets: ["permanent"],
  effect: { kind: "change-text", target: 0, words: "color-or-land-type", duration: "end-of-turn" },
});
