import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 17116.
//
// Rulings:
//   [2014-02-01] If you control more than one Ragemonger, the cost reduction is cumulative.
//   [2014-02-01] If a spell has hybrid mana symbols in its mana cost, you choose which half you
//     will be paying before determining the total cost. If you choose to pay such a cost with {B}
//     or {R}, Ragemonger can reduce that part of the cost.
//   [2014-02-01] You apply cost reduction effects after other cost modifiers, so Ragemonger can
//     reduce additional costs or alternative costs of Minotaur spells if they include {B} and/or
//     {R}.

export default defineCard({
  name: "Ragemonger",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Shaman"],
  power: 2,
  toughness: 3,
  text: "Minotaur spells you cast cost {B}{R} less to cast. This effect reduces only the amount of colored mana you pay. (For example, if you cast a Minotaur spell with mana cost {2}{R}, it costs {2} to cast.)",
  // TODO(scaffold): Minotaur spells you cast cost {B}{R} less to cast. This effect reduces only the amount of colored mana you pay.
});
