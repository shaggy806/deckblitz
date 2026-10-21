import { defineCard, type StaticAbility } from "../define.js";

// Battlebond. EDHREC rank 10249.
//
// Rulings:
//   [2018-06-08] Whether it's legal to cast a spell is determined before its costs are paid. This
//     means that if Archon of Valor's Reach has sorcery as the chosen type, you can't cast Morbid
//     Curiosity, even if you wish to sacrifice Archon of Valor's Reach to do so.
//   [2018-06-08] The enters-the-battlefield effect of Archon of Valor's Reach is a replacement
//     effect that doesn't use the stack. No player can cast spells or activate abilities after it
//     has entered the battlefield but before you choose a card type.
//
// Cloud Key's shape: the type is a `chooseOnEnter` word, asked before the
// Archon moves, and one prohibition per type is live only for the type
// chosen. A spell of the type with other types too (an artifact creature) is
// still a spell of that type.

const TYPES = ["artifact", "enchantment", "instant", "sorcery", "planeswalker"] as const;

const prohibition = (type: (typeof TYPES)[number]): StaticAbility => ({
  affects: { scope: "self" },
  condition: { kind: "chosen-on-enter", value: type },
  prohibits: { who: "each-player", spells: { type } },
  text: `Players can't cast spells of the chosen type (${type}).`,
});

export default defineCard({
  name: "Archon of Valor's Reach",
  manaCost: "{4}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Archon"],
  power: 5,
  toughness: 6,
  keywords: ["flying", "vigilance", "trample"],
  text: "Flying, vigilance, trample\nAs this creature enters, choose artifact, enchantment, instant, sorcery, or planeswalker.\nPlayers can't cast spells of the chosen type.",
  chooseOnEnter: [...TYPES],
  static: TYPES.map(prohibition),
});
