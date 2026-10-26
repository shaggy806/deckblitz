import { defineCard } from "../define.js";
import { kinship } from "../helpers.js";

// EDHREC rank 10876.
//
// Rulings:
//   [2008-04-01] If the top card of your library is already revealed (due to Magus of the Future,
//     for example), you still have the option to reveal it or not as part of a kinship ability’s
//     effect.
//   [2008-04-01] Kinship is an ability word that indicates a group of similar triggered abilities
//     that appear on _Morningtide_ creatures. It doesn’t have any special rules associated with
//     it.
//   [2008-04-01] The first two sentences of every kinship ability are the same (except for the
//     creature’s name). Only the last sentence varies from one kinship ability to the next.
//   [2008-04-01] You don’t have to reveal the top card of your library, even if it shares a
//     creature type with the creature that has the kinship ability.
//   [2008-04-01] If you have multiple creatures with kinship abilities, each triggers and resolves
//     separately. You’ll look at the same card for each one, unless you have some method of
//     shuffling your library or moving that card to a different zone.
//   [2008-04-01] You play the revealed card as part of the resolution of this ability. It’s played
//     from your library, not your hand. You choose modes, pay additional costs, choose targets,
//     etc. for the card as normal when playing it. Any X in the mana cost will be 0. Alternative
//     costs can’t be paid.
//   [2008-04-01] After the kinship ability finishes resolving, the card you looked at remains on
//     top of your library.

export default defineCard({
  name: "Leaf-Crowned Elder",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Shaman"],
  power: 3,
  toughness: 5,
  text: "Kinship — At the beginning of your upkeep, you may look at the top card of your library. If it shares a creature type with this creature, you may reveal it. If you do, you may play that card without paying its mana cost.",
  triggered: [kinship({ kind: "cast-now", target: 0, free: true }, "you may play that card without paying its mana cost")],
});
