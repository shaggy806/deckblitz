import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 9854.
//
// Rulings:
//   [2013-09-15] Auras attached to a creature don't become tapped when the creature becomes
//     tapped. Except in some rare cases, an Aura with bestow remains untapped when it becomes
//     unattached and becomes a creature.
//   [2013-09-15] On the stack, a spell with bestow is either a creature spell or an Aura spell.
//     It's never both, although it's an enchantment spell in either case.
//   [2013-09-15] Unlike other Auras, an Aura with bestow isn't put into its owner's graveyard if
//     it becomes unattached. Rather, the effect making it an Aura ends, it loses enchant creature,
//     and it remains on the battlefield as an enchantment creature. It can attack (and its {T}
//     abilities can be activated, if it has any) on the turn it becomes unattached if it's been
//     under your control continuously, even as an Aura, since your most recent turn began.
//   [2013-09-15] Unlike other Aura spells, an Aura spell with bestow isn't countered if its target
//     is illegal as it begins to resolve. Rather, the effect making it an Aura spell ends, it
//     loses enchant creature, it returns to being an enchantment creature spell, and it resolves
//     and enters the battlefield as an enchantment creature.
//   [2013-09-15] If a permanent with bestow enters the battlefield by any method other than being
//     cast, it will be an enchantment creature. You can't choose to pay the bestow cost and have
//     it become an Aura.

export default defineCard({
  name: "Chromanticore",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  types: ["enchantment", "creature"],
  subtypes: ["Manticore"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "first-strike", "vigilance", "trample", "lifelink"],
  bestow: "{2}{W}{U}{B}{R}{G}",
  text: "Bestow {2}{W}{U}{B}{R}{G} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nFlying, first strike, vigilance, trample, lifelink\nEnchanted creature gets +4/+4 and has flying, first strike, vigilance, trample, and lifelink.",
  // TODO(scaffold): Enchanted creature gets +4/+4 and has flying, first strike, vigilance, trample, and lifelink.
});
