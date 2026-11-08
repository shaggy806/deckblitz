import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 6607.
//
// Rulings:
//   [2024-09-20] If you cast a spell for another cost "rather than pay" its mana cost, you can't
//     choose to cast it for any other alternative cost. You can, however, pay additional costs. If
//     the spell has any mandatory additional costs, such as that of Abhorrent Oculus, those must
//     be paid to cast the spell.
//   [2024-09-20] A player's "opening hand" is the hand of cards the player has after all players
//     have taken mulligans. If players have any cards in hand that allow actions to be taken with
//     them from a player's opening hand, the starting player takes all such actions first in any
//     order, followed by each other player in turn order. Then the first turn begins.
//   [2024-09-20] If you cast a spell for which mana may be spent as though it were mana of any
//     color, you may cast it for Leyline of Mutation's second ability's alternative cost and still
//     spend mana as though it were mana of any color.
//   [2024-09-20] If a spell has {X} in its mana cost, you must choose 0 as the value of X when
//     casting it without paying its mana cost.

export default defineCard({
  name: "Leyline of Mutation",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  beginsOnBattlefield: true,
  text: "If this card is in your opening hand, you may begin the game with it on the battlefield.\nYou may pay {W}{U}{B}{R}{G} rather than pay the mana cost for spells you cast.",
  // TODO(scaffold): You may pay {W}{U}{B}{R}{G} rather than pay the mana cost for spells you cast.
});
