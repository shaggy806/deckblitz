import { defineCard } from "../define.js";

// EDHREC rank 7048.
//
// Rulings:
//   [2014-04-26] If you reveal a land card this way, Keranos's triggered ability will cause you to
//     draw another card.
//   [2020-01-24] The abilities of Gods function as long as they're on the battlefield, regardless
//     of whether they're creatures.
//   [2020-01-24] If an effect causes a God to lose all abilities, its ability that causes it to
//     stop being a creature still applies if appropriate.
//   [2020-01-24] Your devotion to two colors is the number of mana symbols among mana costs of
//     permanents you control that are the first color, the second, or both. If an effect counts
//     your devotion to two colors, a hybrid symbol that is both of those colors is counted just
//     once.
//   [2020-01-24] The type-changing ability that can make a God not be a creature functions only on
//     the battlefield. It's always a creature card in other zones, regardless of your devotion to
//     its color. It's always a creature spell while it's on the stack.
//   [2020-01-24] As a God enters the battlefield, your devotion to its color will determine
//     whether any replacement effects that affect creatures entering the battlefield apply to that
//     God. Because replacement effects are considered before the God is on the battlefield, the
//     mana symbols in its mana cost won't be counted when determining this.
//   [2020-01-24] If a God stops being a creature, it loses the type creature and the creature type
//     God. It continues to be a legendary enchantment.
//   [2020-01-24] If a God is attacking or blocking and it stops being a creature, it will be
//     removed from combat. It won't rejoin combat if it resumes being a creature later during that
//     combat.
//   [2020-01-24] Counters put on a God remain on it while it's not a creature, even if they have
//     no effect.
//   [2020-01-24] When a God enters the battlefield, your devotion to its color (including the mana
//     symbols in the mana cost of the God itself) will determine if a creature entered the
//     battlefield or not for abilities that trigger whenever a creature enters the battlefield.

export default defineCard({
  name: "Keranos, God of Storms",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 6,
  toughness: 5,
  keywords: ["indestructible"],
  text: "Indestructible\nAs long as your devotion to blue and red is less than seven, Keranos isn't a creature.\nReveal the first card you draw on each of your turns. Whenever you reveal a land card this way, draw a card. Whenever you reveal a nonland card this way, Keranos deals 3 damage to any target.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "devotion", colors: ["U", "R"], atMost: 6 },
      removeTypes: ["creature"],
      text: "As long as your devotion to blue and red is less than seven, Keranos isn't a creature.",
    },
    {
      affects: { scope: "self" },
      revealsFirstDrawEachTurn: true,
      text: "Reveal the first card you draw on each of your turns.",
    },
  ],
  // "This way": the first card drawn on a turn of yours, which the static
  // has just revealed — what it is and whose turn it is are part of the
  // trigger condition, asked as it's drawn (`whileCondition`), never again.
  // A land's draw is another card, not revealed (the ruling).
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 1, filter: { type: "land" } },
      whileCondition: { kind: "your-turn" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever you reveal a land card this way, draw a card.",
    },
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 1, filter: { notTypes: ["land"] } },
      whileCondition: { kind: "your-turn" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "Whenever you reveal a nonland card this way, Keranos deals 3 damage to any target.",
    },
  ],
});
