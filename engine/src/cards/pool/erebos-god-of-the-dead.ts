import { defineCard } from "../define.js";

// EDHREC rank 3058.
//
// Rulings:
//   [2013-09-15] If an activated ability or triggered ability has an effect that depends on your
//     devotion to a color, you count the number of mana symbols of that color among the mana costs
//     of permanents you control as the ability resolves. The permanent with that ability will be
//     counted if it's still on the battlefield at that time.
//   [2013-09-15] Hybrid mana symbols, monocolored hybrid mana symbols, and Phyrexian mana symbols
//     do count toward your devotion to their color(s).
//   [2013-09-15] Mana symbols in the text boxes of permanents you control don't count toward your
//     devotion to any color.
//   [2013-09-15] Numeric mana symbols ({0}, {1}, and so on) in mana costs of permanents you
//     control don't count toward your devotion to any color.
//   [2020-01-24] Counters put on a God remain on it while it's not a creature, even if they have
//     no effect.
//   [2020-01-24] When a God enters the battlefield, your devotion to its color (including the mana
//     symbols in the mana cost of the God itself) will determine if a creature entered the
//     battlefield or not for abilities that trigger whenever a creature enters the battlefield.
//   [2020-01-24] The abilities of Gods function as long as they're on the battlefield, regardless
//     of whether they're creatures.
//   [2020-01-24] If an effect causes a God to lose all abilities, its ability that causes it to
//     stop being a creature still applies if appropriate.
//   [2020-01-24] If a God is attacking or blocking and it stops being a creature, it will be
//     removed from combat. It won't rejoin combat if it resumes being a creature later during that
//     combat.
//   [2020-01-24] As a God enters the battlefield, your devotion to its color will determine
//     whether any replacement effects that affect creatures entering the battlefield apply to that
//     God. Because replacement effects are considered before the God is on the battlefield, the
//     mana symbols in its mana cost won't be counted when determining this.
//   [2020-01-24] The type-changing ability that can make a God not be a creature functions only on
//     the battlefield. It's always a creature card in other zones, regardless of your devotion to
//     its color. It's always a creature spell while it's on the stack.
//   [2020-01-24] If a God stops being a creature, it loses the type creature and the creature type
//     God. It continues to be a legendary enchantment.

export default defineCard({
  name: "Erebos, God of the Dead",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 5,
  toughness: 7,
  keywords: ["indestructible"],
  text: "Indestructible\nAs long as your devotion to black is less than five, Erebos isn't a creature. (Each {B} in the mana costs of permanents you control counts toward your devotion to black.)\nYour opponents can't gain life.\n{1}{B}, Pay 2 life: Draw a card.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, payLife: 2 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{1}{B}, Pay 2 life: Draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "devotion", colors: ["B"], atMost: 4 },
      removeTypes: ["creature"],
      text: "As long as your devotion to black is less than five, Erebos isn't a creature.",
    },
    // Archfiend of Despair's.
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "opponent", prevent: true },
      text: "Your opponents can't gain life.",
    },
  ],
});
