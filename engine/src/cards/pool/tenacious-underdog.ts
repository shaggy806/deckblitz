import { defineCard } from "../define.js";

// SNC. Blitz (rule 702.152a) with life in its cost (`blitz.also`, paid with
// the mana as it's cast — rule 601.2h — and unpayable without the life,
// 119.4), from the hand or, for that blitz cost alone, from its owner's
// graveyard (`blitz.fromGraveyard`): a spell cast from a graveyard in every
// way.
//
// Rulings:
//   [2022-04-29] If you pay the blitz cost to cast a creature spell, that permanent will be
//     sacrificed only if it's still on the battlefield when that triggered ability resolves. If it
//     dies or goes to another zone before then, it will stay where it is.
//   [2022-04-29] If you choose to pay the blitz cost rather than the mana cost, you're still
//     casting the spell. It goes on the stack and can be responded to and countered. You can cast a
//     creature spell for its blitz cost only if you could cast that creature spell. Most of the
//     time, this means during your main phase when the stack is empty.
//   [2022-04-29] The triggered ability that lets its controller draw a card triggers when it dies
//     for any reason, not just when you sacrifice it during the end step.
//   [2022-04-29] If a creature enters the battlefield as a copy of or becomes a copy of a creature
//     whose blitz cost was paid, the copy won't have haste, won't be sacrificed, and its controller
//     won't draw a card when it dies.
//   [2022-04-29] You don't have to attack with the creature with blitz unless another ability says
//     you do.

const BLITZ_TEXT =
  'Blitz—{2}{B}{B}, Pay 2 life. (If you cast this spell for its blitz cost, it gains haste and "When this creature dies, draw a card." Sacrifice it at the beginning of the next end step.)';
const GRAVEYARD_TEXT = "You may cast this card from your graveyard using its blitz ability.";

export default defineCard({
  name: "Tenacious Underdog",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  text: `${BLITZ_TEXT}\n${GRAVEYARD_TEXT}`,
  blitz: { cost: "{2}{B}{B}", also: { text: "Pay 2 life", payLife: 2 }, fromGraveyard: true },
});
