import { defineCard } from "../define.js";
import { kinship } from "../helpers.js";

// EDHREC rank 27054.
//
// Rulings:
//   [2008-04-01] If the top card of your library is already revealed (due to Magus of the Future,
//     for example), you still have the option to reveal it or not as part of a kinship ability’s
//     effect.
//   [2008-04-01] If you have multiple creatures with kinship abilities, each triggers and resolves
//     separately. You’ll look at the same card for each one, unless you have some method of
//     shuffling your library or moving that card to a different zone.
//   [2008-04-01] The first two sentences of every kinship ability are the same (except for the
//     creature’s name). Only the last sentence varies from one kinship ability to the next.
//   [2008-04-01] You don’t have to reveal the top card of your library, even if it shares a
//     creature type with the creature that has the kinship ability.
//   [2008-04-01] After the kinship ability finishes resolving, the card you looked at remains on
//     top of your library.
//   [2008-04-01] Kinship is an ability word that indicates a group of similar triggered abilities
//     that appear on _Morningtide_ creatures. It doesn’t have any special rules associated with
//     it.

export default defineCard({
  name: "Winnower Patrol",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 2,
  text: "Kinship — At the beginning of your upkeep, you may look at the top card of your library. If it shares a creature type with this creature, you may reveal it. If you do, put a +1/+1 counter on this creature.",
  triggered: [kinship({ kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 }, "put a +1/+1 counter on this creature")],
});
