import { defineCard } from "../define.js";

// EDHREC rank 11682. Fate Reforged.
//
// One exile out of the graveyard, one shuffled face-down pile, each card of
// it manifested under the caster in that random order (rules 406.3, 701.40a,
// 708.5): `cloak-exiled-pile`'s `graveyard` with `manifest`. An opponent's
// card is manifested under its caster's control (110.2a).
//
// Rulings:
//   [2014-11-24] There are no cards in the Fate Reforged set that would turn a face-down instant
//     or sorcery card on the battlefield face up, but some older cards can try to do this. If
//     something tries to turn a face-down instant or sorcery card on the battlefield face up,
//     reveal that card to show all players it's an instant or sorcery card. The permanent remains
//     on the battlefield face down. Abilities that trigger when a permanent turns face up won't
//     trigger, because even though you revealed the card, it never turned face up.
//   [2014-11-24] Because face-down creatures don't have names, they can't have the same name as
//     any other creature, even another face-down creature.
//   [2014-11-24] Any time you have priority, you may turn a manifested creature face up by
//     revealing that it's a creature card (ignoring any copy effects or type-changing effects that
//     might be applying to it) and paying its mana cost. This is a special action. It doesn't use
//     the stack and can't be responded to.
//   [2014-11-24] The pile is shuffled to disguise from your opponents which manifested creature is
//     which. After you manifest the cards, you can look at them.
//   [2014-11-24] Turning a permanent face up or face down doesn't change whether that permanent is
//     tapped or untapped.
//   [2014-11-24] If a manifested creature would have morph if it were face up, you may also turn
//     it face up by paying its morph cost.
//   [2014-11-24] If you manifest a card owned by an opponent and you leave the game, that card is
//     exiled.
//   [2014-11-24] Unlike a face-down creature that was cast using the morph ability, a manifested
//     creature may still be turned face up after it loses its abilities if it's a creature card.
//   [2014-11-24] The face-down permanent is a 2/2 creature with no name, mana cost, creature
//     types, or abilities. It's colorless and has a mana value of 0. Other effects that apply to
//     the permanent can still grant or change any of these characteristics.
//   [2014-11-24] You must ensure that your face-down spells and permanents can easily be
//     differentiated from each other. You're not allowed to mix up the cards that represent them
//     on the battlefield in order to confuse other players. The order they entered the battlefield
//     should remain clear. Common methods for indicating this include using markers or dice, or
//     simply placing them in order on the battlefield. You must also track how each became face
//     down (manifested, cast face down using the morph ability, and so on).
//   [2014-11-24] Because the permanent is on the battlefield both before and after it's turned
//     face up, turning a permanent face up doesn't cause any enters-the-battlefield abilities to
//     trigger.
//   [2014-11-24] If a face-down permanent you control leaves the battlefield, you must reveal it.
//     You must also reveal all face-down spells and permanents you control if you leave the game
//     or if the game ends.
//   [2014-11-24] If a double-faced card is manifested, it will be put onto the battlefield face
//     down. While face down, it can't transform. If the front face of the card is a creature card,
//     you can turn it face up by paying its mana cost. If you do, its front face will be up.
//   [2014-11-24] At any time, you can look at a face-down permanent you control. You can't look at
//     face-down permanents you don't control unless an effect allows you to or instructs you to.
//   [2014-11-24] A permanent that turns face up or face down changes characteristics but is
//     otherwise the same permanent. Spells and abilities that were targeting that permanent, as
//     well as Auras and Equipment that were attached to the permanent, aren't affected.

export default defineCard({
  name: "Ghastly Conscription",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile all creature cards from target player's graveyard in a face-down pile, shuffle that pile, then manifest those cards. (To manifest a card, put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)",
  targets: ["player"],
  effect: { kind: "cloak-exiled-pile", manifest: true, graveyard: { of: 0, filter: { type: "creature" } } },
});
