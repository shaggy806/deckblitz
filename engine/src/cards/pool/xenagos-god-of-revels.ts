import { defineCard } from "../define.js";

// EDHREC rank 1216.
//
// Rulings:
//   [2013-09-15] Mana symbols in the text boxes of permanents you control don't count toward your
//     devotion to any color.
//   [2013-09-15] If an activated ability or triggered ability has an effect that depends on your
//     devotion to a color, you count the number of mana symbols of that color among the mana costs
//     of permanents you control as the ability resolves. The permanent with that ability will be
//     counted if it's still on the battlefield at that time.
//   [2013-09-15] Hybrid mana symbols, monocolored hybrid mana symbols, and Phyrexian mana symbols
//     do count toward your devotion to their color(s).
//   [2013-09-15] Numeric mana symbols ({0}, {1}, and so on) in mana costs of permanents you
//     control don't count toward your devotion to any color.
//   [2014-02-01] The value of X is calculated only once, as the ability resolves.
//   [2020-11-10] If Xenagos stops being a creature, it loses the type creature and the creature
//     type God. It continues to be a legendary enchantment.
//   [2020-11-10] Your devotion to two colors is the number of mana symbols among mana costs of
//     permanents you control that are the first color, the second, or both. If an effect counts
//     your devotion to two colors, a hybrid symbol that is both of those colors is counted just
//     once.
//   [2020-11-10] As Xenagos enters the battlefield, your devotion to red and green will determine
//     whether any replacement effects that affect creatures entering the battlefield apply.
//     Because replacement effects are considered before Xenagos is on the battlefield, the mana
//     symbols in its mana cost won't be counted when determining this.
//   [2020-11-10] The type-changing ability that can make Xenagos not be a creature functions only
//     on the battlefield. It's always a creature card in other zones, regardless of your devotion
//     to red and green. It's always a creature spell while it's on the stack.
//   [2020-11-10] When Xenagos enters the battlefield, your devotion to red and green will
//     determine if a creature entered the battlefield or not for abilities that trigger whenever a
//     creature enters the battlefield. The mana symbols in Xenagos's own mana cost are counted
//     when determining this.
//   [2020-11-10] If Xenagos is attacking or blocking and it stops being a creature, it will be
//     removed from combat. It won't rejoin combat if it resumes being a creature later during that
//     combat.
//   [2020-11-10] Counters put on Xenagos remain on it while it's not a creature, even if they have
//     no effect.
//   [2020-11-10] Xenagos's abilities function as long as it's on the battlefield, regardless of
//     whether it's a creature.
//   [2020-11-10] If an effect causes Xenagos to lose all abilities, its ability that causes it to
//     stop being a creature still applies if appropriate.

export default defineCard({
  name: "Xenagos, God of Revels",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 6,
  toughness: 5,
  keywords: ["indestructible"],
  text: "Indestructible\nAs long as your devotion to red and green is less than seven, Xenagos isn't a creature.\nAt the beginning of combat on your turn, another target creature you control gains haste and gets +X/+X until end of turn, where X is that creature's power.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      // X is its power as this resolves, read once (the ruling): `modify-pt`
      // reads both amounts before applying either (Winged Temple of Orazca).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          { kind: "modify-pt", target: 0, power: { powerOf: 0 }, toughness: { powerOf: 0 }, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "At the beginning of combat on your turn, another target creature you control gains haste and gets +X/+X until end of turn, where X is that creature's power.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "devotion", colors: ["R", "G"], atMost: 6 },
      removeTypes: ["creature"],
      text: "As long as your devotion to red and green is less than seven, Xenagos isn't a creature.",
    },
  ],
});
