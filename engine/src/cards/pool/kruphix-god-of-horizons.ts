import { defineCard } from "../define.js";

// EDHREC rank 4816.
//
// Rulings:
//   [2014-04-26] If unspent mana has any restrictions or riders associated with it (for example,
//     if it was produced by Cavern of Souls), those restrictions or riders will remain associated
//     with that mana when it becomes colorless.
//   [2014-04-26] As long as Kruphix is on the battlefield, you'll keep unspent mana as steps and
//     phases end (although it will become colorless). This means you can add mana and spend it
//     during a future step, phase, or turn. Once Kruphix leaves the battlefield, you have until
//     the end of the current step or phase to use the mana before it disappears.
//   [2020-01-24] If an effect causes a God to lose all abilities, its ability that causes it to
//     stop being a creature still applies if appropriate.
//   [2020-01-24] When a God enters the battlefield, your devotion to its color (including the mana
//     symbols in the mana cost of the God itself) will determine if a creature entered the
//     battlefield or not for abilities that trigger whenever a creature enters the battlefield.
//   [2020-01-24] The type-changing ability that can make a God not be a creature functions only on
//     the battlefield. It's always a creature card in other zones, regardless of your devotion to
//     its color. It's always a creature spell while it's on the stack.
//   [2020-01-24] Your devotion to two colors is the number of mana symbols among mana costs of
//     permanents you control that are the first color, the second, or both. If an effect counts
//     your devotion to two colors, a hybrid symbol that is both of those colors is counted just
//     once.
//   [2020-01-24] Counters put on a God remain on it while it's not a creature, even if they have
//     no effect.
//   [2020-01-24] If a God stops being a creature, it loses the type creature and the creature type
//     God. It continues to be a legendary enchantment.
//   [2020-01-24] If a God is attacking or blocking and it stops being a creature, it will be
//     removed from combat. It won't rejoin combat if it resumes being a creature later during that
//     combat.
//   [2020-01-24] The abilities of Gods function as long as they're on the battlefield, regardless
//     of whether they're creatures.
//   [2020-01-24] As a God enters the battlefield, your devotion to its color will determine
//     whether any replacement effects that affect creatures entering the battlefield apply to that
//     God. Because replacement effects are considered before the God is on the battlefield, the
//     mana symbols in its mana cost won't be counted when determining this.

export default defineCard({
  name: "Kruphix, God of Horizons",
  manaCost: "{3}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 4,
  toughness: 7,
  keywords: ["indestructible"],
  text: "Indestructible\nAs long as your devotion to green and blue is less than seven, Kruphix isn't a creature.\nYou have no maximum hand size.\nIf you would lose unspent mana, that mana becomes colorless instead.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "devotion", colors: ["G", "U"], atMost: 6 },
      removeTypes: ["creature"],
      text: "As long as your devotion to green and blue is less than seven, Kruphix isn't a creature.",
    },
    { affects: { scope: "self" }, noMaxHandSize: true, text: "You have no maximum hand size." },
    {
      affects: { scope: "self" },
      unspentManaBecomesColorless: true,
      text: "If you would lose unspent mana, that mana becomes colorless instead.",
    },
  ],
});
