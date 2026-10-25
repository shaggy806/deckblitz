import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 22543.
//
// Rulings:
//   [2013-09-15] On the stack, a spell with bestow is either a creature spell or an Aura spell.
//     It's never both, although it's an enchantment spell in either case.
//   [2013-09-15] Auras attached to a creature don't become tapped when the creature becomes
//     tapped. Except in some rare cases, an Aura with bestow remains untapped when it becomes
//     unattached and becomes a creature.
//   [2013-09-15] Unlike other Auras, an Aura with bestow isn't put into its owner's graveyard if
//     it becomes unattached. Rather, the effect making it an Aura ends, it loses enchant creature,
//     and it remains on the battlefield as an enchantment creature. It can attack (and its {T}
//     abilities can be activated, if it has any) on the turn it becomes unattached if it's been
//     under your control continuously, even as an Aura, since your most recent turn began.
//   [2013-09-15] If a permanent with bestow enters the battlefield by any method other than being
//     cast, it will be an enchantment creature. You can't choose to pay the bestow cost and have
//     it become an Aura.
//   [2013-09-15] Unlike other Aura spells, an Aura spell with bestow isn't countered if its target
//     is illegal as it begins to resolve. Rather, the effect making it an Aura spell ends, it
//     loses enchant creature, it returns to being an enchantment creature spell, and it resolves
//     and enters the battlefield as an enchantment creature.

export default defineCard({
  name: "Spiteful Returned",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 1,
  bestow: "{3}{B}",
  text: "Bestow {3}{B} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nWhenever this creature or enchanted creature attacks, defending player loses 2 life.\nEnchanted creature gets +1/+1.",
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." }],
  // TODO(scaffold): Whenever this creature or enchanted creature attacks, defending player loses 2 life.
});
