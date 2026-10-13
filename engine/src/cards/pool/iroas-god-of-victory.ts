import { defineCard } from "../define.js";

// EDHREC rank 1456.
//
// Rulings:
//   [2014-04-26] Iroas's last ability prevents all damage dealt to attacking creatures you
//     control, not just combat damage.
//   [2020-01-24] When a God enters the battlefield, your devotion to its color (including the mana
//     symbols in the mana cost of the God itself) will determine if a creature entered the
//     battlefield or not for abilities that trigger whenever a creature enters the battlefield.
//   [2020-01-24] As a God enters the battlefield, your devotion to its color will determine
//     whether any replacement effects that affect creatures entering the battlefield apply to that
//     God. Because replacement effects are considered before the God is on the battlefield, the
//     mana symbols in its mana cost won't be counted when determining this.
//   [2020-01-24] The type-changing ability that can make a God not be a creature functions only on
//     the battlefield. It's always a creature card in other zones, regardless of your devotion to
//     its color. It's always a creature spell while it's on the stack.
//   [2020-01-24] If a God stops being a creature, it loses the type creature and the creature type
//     God. It continues to be a legendary enchantment.
//   [2020-01-24] The abilities of Gods function as long as they're on the battlefield, regardless
//     of whether they're creatures.
//   [2020-01-24] Counters put on a God remain on it while it's not a creature, even if they have
//     no effect.
//   [2020-01-24] If a God is attacking or blocking and it stops being a creature, it will be
//     removed from combat. It won't rejoin combat if it resumes being a creature later during that
//     combat.
//   [2020-01-24] Your devotion to two colors is the number of mana symbols among mana costs of
//     permanents you control that are the first color, the second, or both. If an effect counts
//     your devotion to two colors, a hybrid symbol that is both of those colors is counted just
//     once.
//   [2020-01-24] If an effect causes a God to lose all abilities, its ability that causes it to
//     stop being a creature still applies if appropriate.

export default defineCard({
  name: "Iroas, God of Victory",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 7,
  toughness: 4,
  keywords: ["indestructible"],
  text: "Indestructible\nAs long as your devotion to red and white is less than seven, Iroas isn't a creature.\nCreatures you control have menace.\nPrevent all damage that would be dealt to attacking creatures you control.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "devotion", colors: ["R", "W"], atMost: 6 },
      removeTypes: ["creature"],
      text: "As long as your devotion to red and white is less than seven, Iroas isn't a creature.",
    },
    {
      affects: { scope: "creatures-you-control" },
      grantKeywords: ["menace"],
      text: "Creatures you control have menace.",
    },
    {
      // All damage, not just combat damage (the ruling).
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        toFilter: { type: "creature", attacking: true, controlledBy: "you" },
      },
      text: "Prevent all damage that would be dealt to attacking creatures you control.",
    },
  ],
});
