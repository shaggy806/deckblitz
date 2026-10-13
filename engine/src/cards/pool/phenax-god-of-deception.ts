import { defineCard } from "../define.js";

// EDHREC rank 5086.
//
// Rulings:
//   [2013-09-15] Numeric mana symbols ({0}, {1}, and so on) in mana costs of permanents you
//     control don't count toward your devotion to any color.
//   [2013-09-15] Hybrid mana symbols, monocolored hybrid mana symbols, and Phyrexian mana symbols
//     do count toward your devotion to their color(s).
//   [2013-09-15] If an activated ability or triggered ability has an effect that depends on your
//     devotion to a color, you count the number of mana symbols of that color among the mana costs
//     of permanents you control as the ability resolves. The permanent with that ability will be
//     counted if it's still on the battlefield at that time.
//   [2013-09-15] Mana symbols in the text boxes of permanents you control don't count toward your
//     devotion to any color.
//   [2014-02-01] If you tap Phenax to activate the ability it grants itself, and Phenax is no
//     longer a creature but still on the battlefield as that ability resolves, no cards will be
//     put into the target player's graveyard. Similarly, if Phenax isn't on the battlefield as the
//     ability resolves and wasn't a creature when it left the battlefield, no cards will be put
//     into the graveyard.
//   [2014-02-01] If Phenax is a creature, it will grant itself the activated ability.
//   [2014-02-01] If you activate the ability Phenax grants to creatures you control, the toughness
//     of the creature is calculated as the ability resolves. If the creature is no longer on the
//     battlefield at that time, use its toughness when it was last on the battlefield.
//   [2020-01-24] The type-changing ability that can make a God not be a creature functions only on
//     the battlefield. It's always a creature card in other zones, regardless of your devotion to
//     its color. It's always a creature spell while it's on the stack.
//   [2020-01-24] If a God stops being a creature, it loses the type creature and the creature type
//     God. It continues to be a legendary enchantment.
//   [2020-01-24] As a God enters the battlefield, your devotion to its color will determine
//     whether any replacement effects that affect creatures entering the battlefield apply to that
//     God. Because replacement effects are considered before the God is on the battlefield, the
//     mana symbols in its mana cost won't be counted when determining this.
//   [2020-01-24] If an effect causes a God to lose all abilities, its ability that causes it to
//     stop being a creature still applies if appropriate.
//   [2020-01-24] If a God is attacking or blocking and it stops being a creature, it will be
//     removed from combat. It won't rejoin combat if it resumes being a creature later during that
//     combat.
//   [2020-01-24] Counters put on a God remain on it while it's not a creature, even if they have
//     no effect.
//   [2020-01-24] When a God enters the battlefield, your devotion to its color (including the mana
//     symbols in the mana cost of the God itself) will determine if a creature entered the
//     battlefield or not for abilities that trigger whenever a creature enters the battlefield.
//   [2020-01-24] The abilities of Gods function as long as they're on the battlefield, regardless
//     of whether they're creatures.
//   [2020-01-24] Your devotion to two colors is the number of mana symbols among mana costs of
//     permanents you control that are the first color, the second, or both. If an effect counts
//     your devotion to two colors, a hybrid symbol that is both of those colors is counted just
//     once.

export default defineCard({
  name: "Phenax, God of Deception",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 4,
  toughness: 7,
  keywords: ["indestructible"],
  text: "Indestructible\nAs long as your devotion to blue and black is less than seven, Phenax isn't a creature.\nCreatures you control have \"{T}: Target player mills X cards, where X is this creature's toughness.\"",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "devotion", colors: ["U", "B"], atMost: 6 },
      removeTypes: ["creature"],
      text: "As long as your devotion to blue and black is less than seven, Phenax isn't a creature.",
    },
    {
      // Phenax grants it to itself while it's a creature (the ruling). X is
      // the toughness as it resolves, or as the creature last existed — and
      // 0 for one that isn't a creature then, or wasn't as it left (rule
      // 208.3, the rulings).
      affects: { scope: "creatures-you-control" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["player"],
          effect: { kind: "mill", target: 0, amount: { toughnessOf: "source" } },
          resolve: null,
          text: "{T}: Target player mills X cards, where X is this creature's toughness.",
        },
      ],
      text: "Creatures you control have \"{T}: Target player mills X cards, where X is this creature's toughness.\"",
    },
  ],
});
