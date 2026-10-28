import { defineCard } from "../define.js";
import { embalmAbility } from "../helpers.js";

// Its embalmed token copy can block an additional creature too (a copy).

// EDHREC rank 25779.
// Makes Trueheart Duelist → new token "Trueheart Duelist Token" (scaffolded).
//
// Rulings:
//   [2017-04-18] The token is a Zombie in addition to its other types and is white instead of its
//     other colors. It has no mana cost, and thus its mana value is 0. These are copiable values
//     of the token that other effects may copy.
//   [2017-04-18] For each card with embalm, a corresponding game play supplement token can be
//     found in some Amonkhet booster packs. These supplements are not required to play with cards
//     with embalm; you can use the same items to represent an embalmed token as you would any
//     other token.
//   [2017-04-18] The token copies exactly what was printed on the original card and nothing else.
//     It doesn't copy any information about the object the card was before it was put into your
//     graveyard.
//   [2017-07-14] If a spell or ability puts a creature card with embalm into your graveyard during
//     your main phase, you'll have priority immediately after that spell or ability resolves. You
//     can activate the creature card's embalm ability before any player can exile it with an
//     effect, such as that of Crook of Condemnation, if it's legal for you to do so.
//   [2017-07-14] Once you've activated an embalm ability, the card is immediately exiled.
//     Opponents can't try to stop the ability by exiling the card with an effect such as that of
//     Crook of Condemnation.

const BLOCK_TEXT = "This creature can block an additional creature each combat.";
const EMBALM_TEXT =
  "Embalm {2}{W} ({2}{W}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a white Zombie Human Warrior with no mana cost. Embalm only as a sorcery.)";

export default defineCard({
  name: "Trueheart Duelist",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: "This creature can block an additional creature each combat.\nEmbalm {2}{W} ({2}{W}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a white Zombie Human Warrior with no mana cost. Embalm only as a sorcery.)",
  static: [
    {
      affects: { scope: "self" },
      blockAdditional: 1,
      text: BLOCK_TEXT,
    },
  ],
  activated: [embalmAbility("{2}{W}", EMBALM_TEXT)],
});
