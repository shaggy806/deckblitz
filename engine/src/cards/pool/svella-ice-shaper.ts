import { defineCard } from "../define.js";

// EDHREC rank 6822.
// Makes Icy Manalith → "Icy Manalith Token".
//
// Rulings:
//   [2021-02-05] The Kaldheim set doesn’t have any cards with mana costs that include {S}, but
//     some previous sets do. If an effect says such a spell costs {1} less to cast, that reduction
//     doesn’t apply to any {S} costs. This is also true for activated abilities that include {S}
//     in their activation costs and effects that reduce those costs.
//   [2021-02-05] The spell you cast with Svella’s last ability is cast from your library.
//   [2021-02-05] If the spell has {X} in its mana cost, you must choose 0 as the value of X.
//   [2021-02-05] If you cast a spell “without paying its mana cost,” you can’t choose to cast it
//     for any alternative costs. You can, however, pay additional costs, such as kicker costs. If
//     the card has any mandatory additional costs, those must be paid to cast the spell.
//   [2021-02-05] Some cards have additional effects for each {S} spent to cast them. You can cast
//     these spells even if you don’t spend any snow mana to cast them; their additional effects
//     simply won’t do anything.
//   [2021-02-05] If you cast a spell using Svella’s ability, you do so as part of the resolution
//     of that ability. You can’t wait to cast it later in the turn. Timing permissions based on
//     the card’s type are ignored.
//   [2021-02-05] Snow isn’t a type of mana. If an effect says you may spend mana as though it were
//     any type, you can’t pay for {S} using mana that wasn’t produced by a snow source.
//   [2021-02-05] The {S} symbol is a generic mana symbol. It represents a cost that can be paid by
//     one mana that was produced by a snow source. That mana can be any color or colorless.
//   [2021-02-05] In some unusual cases, the order of your library will matter as you cast the
//     spell from among the revealed cards. Remember that looking at the top cards of your library
//     doesn’t change their order or allow you to change their order. You don’t put the cards on
//     the bottom of your library until after you are done casting the spell.
//   [2021-02-05] Snow is a supertype, not a card type. It has no rules meaning or function by
//     itself, but spells and abilities may refer to it.
//   [2021-02-05] You’ll put the cards you didn’t cast on the bottom of your library before the
//     spell you cast resolves.

export default defineCard({
  name: "Svella, Ice Shaper",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary", "snow"],
  types: ["creature"],
  subtypes: ["Troll", "Warrior"],
  power: 2,
  toughness: 4,
  text: "{3}, {T}: Create a colorless snow artifact token named Icy Manalith with \"{T}: Add one mana of any color.\"\n{6}{R}{G}, {T}: Look at the top four cards of your library. You may cast a spell from among them without paying its mana cost. Put the rest on the bottom of your library in a random order.",
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Icy Manalith Token", count: 1 },
      resolve: null,
      text: "{3}, {T}: Create a colorless snow artifact token named Icy Manalith with \"{T}: Add one mana of any color.\"",
    },
    {
      cost: { mana: "{6}{R}{G}", tap: true },
      targets: [],
      effect: { kind: "cast-now", from: { libraryTop: 4 }, free: true, rest: "bottom-random" },
      resolve: null,
      text: "{6}{R}{G}, {T}: Look at the top four cards of your library. You may cast a spell from among them without paying its mana cost. Put the rest on the bottom of your library in a random order.",
    },
  ],
});
