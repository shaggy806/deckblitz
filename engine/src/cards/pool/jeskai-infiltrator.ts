import { defineCard } from "../define.js";

// EDHREC rank 19284. Fate Reforged.
//
// "Exile it and the top card of your library in a face-down pile, shuffle
// that pile, then manifest those cards" is `cloak-exiled-pile` with `source`
// and `manifest`: one exile, one shuffled pile (rules 406.3, 701.40a, 708.5),
// the Infiltrator only while it's still the permanent that dealt the damage
// (the ruling: else just the library card).
//
// Rulings:
//   [2014-11-24] If a double-faced card is manifested, it will be put onto the battlefield face
//     down. While face down, it can't transform. If the front face of the card is a creature card,
//     you can turn it face up by paying its mana cost. If you do, its front face will be up.
//   [2014-11-24] The pile is shuffled to disguise from your opponents which manifested creature is
//     which. After you manifest the cards, you can look at them.
//   [2014-11-24] Any time you have priority, you may turn a manifested creature face up by
//     revealing that it's a creature card (ignoring any copy effects or type-changing effects that
//     might be applying to it) and paying its mana cost. This is a special action. It doesn't use
//     the stack and can't be responded to.
//   [2014-11-24] Unlike a face-down creature that was cast using the morph ability, a manifested
//     creature may still be turned face up after it loses its abilities if it's a creature card.
//   [2014-11-24] If Jeskai Infiltrator isn't on the battlefield as its triggered ability resolves,
//     you'll manifest just the top card of your library.
//   [2014-11-24] A card's owner is public information at all times. If the two cards you exile are
//     owned by different players (perhaps because you gained control of a Jeskai Infiltrator owned
//     by your opponent), which card is which is no longer hidden from your opponent. That player
//     will know which face-down creature they own.
//   [2014-11-24] Because face-down creatures don't have names, they can't have the same name as
//     any other creature, even another face-down creature.
//   [2014-11-24] At any time, you can look at a face-down permanent you control. You can't look at
//     face-down permanents you don't control unless an effect allows you to or instructs you to.
//   [2014-11-24] You must ensure that your face-down spells and permanents can easily be
//     differentiated from each other. You're not allowed to mix up the cards that represent them
//     on the battlefield in order to confuse other players. The order they entered the battlefield
//     should remain clear. Common methods for indicating this include using markers or dice, or
//     simply placing them in order on the battlefield. You must also track how each became face
//     down (manifested, cast face down using the morph ability, and so on).
//   [2014-11-24] Because the permanent is on the battlefield both before and after it's turned
//     face up, turning a permanent face up doesn't cause any enters-the-battlefield abilities to
//     trigger.
//   [2014-11-24] Turning a permanent face up or face down doesn't change whether that permanent is
//     tapped or untapped.
//   [2014-11-24] There are no cards in the Fate Reforged set that would turn a face-down instant
//     or sorcery card on the battlefield face up, but some older cards can try to do this. If
//     something tries to turn a face-down instant or sorcery card on the battlefield face up,
//     reveal that card to show all players it's an instant or sorcery card. The permanent remains
//     on the battlefield face down. Abilities that trigger when a permanent turns face up won't
//     trigger, because even though you revealed the card, it never turned face up.
//   [2014-11-24] If a face-down permanent you control leaves the battlefield, you must reveal it.
//     You must also reveal all face-down spells and permanents you control if you leave the game
//     or if the game ends.
//   [2014-11-24] The face-down permanent is a 2/2 creature with no name, mana cost, creature
//     types, or abilities. It's colorless and has a mana value of 0. Other effects that apply to
//     the permanent can still grant or change any of these characteristics.
//   [2014-11-24] If a manifested creature would have morph if it were face up, you may also turn
//     it face up by paying its morph cost.
//   [2014-11-24] A permanent that turns face up or face down changes characteristics but is
//     otherwise the same permanent. Spells and abilities that were targeting that permanent, as
//     well as Auras and Equipment that were attached to the permanent, aren't affected.
//   [2014-11-24] If you manifest a card owned by an opponent and you leave the game, that card is
//     exiled.
//   [2018-07-13] You must ensure that your face-down spells and permanents can easily be
//     differentiated from each other. You're not allowed to mix up the cards that represent them
//     on the battlefield to confuse other players. The order they entered the battlefield should
//     remain clear. Common methods for indicating this include using markers or dice, or simply
//     placing them in order on the battlefield. You must also track how each became face down
//     (manifested, cast face down using a morph ability, and so on).
//   [2018-07-13] At any time, you can look at a face-down permanent you control. You can't look at
//     face-down permanents you don't control unless an effect instructs you to do so.
//   [2018-07-13] There are no cards in this set that would turn a face-down instant or sorcery
//     card on the battlefield face up, but some older cards can try to do this. If something tries
//     to turn a face-down instant or sorcery card on the battlefield face up, reveal that card to
//     show all players it's an instant or sorcery card. The permanent remains on the battlefield
//     face down. Abilities that trigger when a permanent turns face up won't trigger, because even
//     though you revealed the card, it never turned face up.
//   [2018-07-13] The face-down permanent is a 2/2 creature with no name, mana cost, creature
//     types, or abilities. It's colorless and has a mana value of 0. Other effects that apply to
//     the permanent can still grant or change any of these characteristics.
//   [2018-07-13] If a face-down permanent you control leaves the battlefield, you must reveal it.
//     You must also reveal all face-down spells and permanents you control if you leave the game
//     or if the game ends.
//   [2018-07-13] Some previous Magic sets feature double-faced cards, which have a Magic card face
//     on each side rather than a Magic card face on one side and a Magic card back on the other.
//     If a double-faced card is manifested, it will be put onto the battlefield face down. While
//     face down, it can't transform. If the front face of the card is a creature card, you can
//     turn it face up by paying its mana cost. If you do, its front face will be up. Although a
//     double-faced card can enter the battlefield face down, one already on the battlefield can't
//     be turned face down.
//   [2018-07-13] Turning a permanent face up or face down doesn't change whether that permanent is
//     tapped or untapped.
//   [2018-07-13] A permanent that turns face up or face down changes characteristics but is
//     otherwise the same permanent. Spells and abilities that were targeting that permanent, as
//     well as Auras and Equipment that were attached to the permanent, aren't affected.
//   [2018-07-13] Because face-down creatures don't have a name, they can't have the same name as
//     any other creature or share any creature types with any other creature, even another
//     face-down creature.
//   [2018-07-13] Any time you have priority, you may turn a manifested creature face up by
//     revealing that it's a creature card (ignoring any type-changing effects that might be
//     applying to it) and paying its mana cost. This is a special action. It doesn't use the stack
//     and can't be responded to.
//   [2018-07-13] Because the permanent is on the battlefield both before and after it's turned
//     face up, turning a permanent face up doesn't cause any enters-the-battlefield abilities to
//     trigger.
//   [2018-07-13] If an effect tries to return a face-down creature to the battlefield after it
//     leaves (such as Aminatou's second ability or Adarkar Valkyrie's delayed triggered ability),
//     that effect returns the card face up. If it tries to put an instant or sorcery card onto the
//     battlefield this way, that card remains in its current zone instead.
//   [2018-07-13] The face-down characteristics of a permanent are copiable values. If another
//     object becomes a copy of a face-down creature or if a token is created that's a copy of a
//     face-down creature, that new object is a 2/2 colorless face-up creature with no abilities.

export default defineCard({
  name: "Jeskai Infiltrator",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 2,
  toughness: 3,
  text: "This creature can't be blocked as long as you control no other creatures.\nWhen this creature deals combat damage to a player, exile it and the top card of your library in a face-down pile, shuffle that pile, then manifest those cards. (To manifest a card, put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "cloak-exiled-pile", manifest: true, source: true, libraryTop: 1 },
      resolve: null,
      text: "When this creature deals combat damage to a player, exile it and the top card of your library in a face-down pile, shuffle that pile, then manifest those cards.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "controls", filter: { type: "creature" }, atLeast: 1, excludeSelf: true } },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked as long as you control no other creatures.",
    },
  ],
});
