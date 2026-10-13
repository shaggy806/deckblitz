import { defineCard } from "../define.js";

// EDHREC rank 4512.
//
// Rulings:
//   [2020-01-24] The type-changing ability that can make a God not be a creature functions only on
//     the battlefield. It’s always a creature card in other zones, regardless of your devotion to
//     its color. It’s always a creature spell while it’s on the stack.
//   [2020-01-24] Mana symbols in the text boxes of permanents you control don’t count toward your
//     devotion to any color.
//   [2020-01-24] Counters put on a God remain on it while it’s not a creature, even if they have
//     no effect.
//   [2020-01-24] When a God enters the battlefield, your devotion to its color (including the mana
//     symbols in the mana cost of the God itself) will determine if a creature entered the
//     battlefield or not for abilities that trigger whenever a creature enters the battlefield.
//   [2020-01-24] As a God enters the battlefield, your devotion to its color will determine
//     whether any replacement effects that affect creatures entering the battlefield apply to that
//     God. Because replacement effects are considered before the God is on the battlefield, the
//     mana symbols in its mana cost won’t be counted when determining this.
//   [2020-01-24] Hybrid mana symbols, monocolored hybrid mana symbols, and Phyrexian mana symbols
//     do count toward your devotion to their color(s).
//   [2020-01-24] If an activated ability or triggered ability has an effect that depends on your
//     devotion to a color, you count the number of mana symbols of that color among the mana costs
//     of permanents you control as the ability resolves. The permanent with that ability will be
//     counted if it’s still on the battlefield at that time.
//   [2020-01-24] If you put an Aura on an opponent’s permanent, you still control the Aura, and
//     mana symbols in its mana cost count towards your devotion.
//   [2020-01-24] If an effect causes a God to lose all abilities, its ability that causes it to
//     stop being a creature still applies if appropriate.
//   [2020-01-24] Colorless and generic mana symbols ({C}, {0}, {1}, {2}, {X}, and so on) in mana
//     costs of permanents you control don’t count toward your devotion to any color.
//   [2020-01-24] The abilities of Gods function as long as they’re on the battlefield, regardless
//     of whether they’re creatures.
//   [2020-01-24] If a God stops being a creature, it loses the type creature and the creature type
//     God. It continues to be a legendary enchantment.
//   [2020-01-24] If a God is attacking or blocking and it stops being a creature, it will be
//     removed from combat. It won’t rejoin combat if it resumes being a creature later during that
//     combat.

export default defineCard({
  name: "Purphoros, Bronze-Blooded",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 7,
  toughness: 6,
  keywords: ["indestructible"],
  text: "Indestructible\nAs long as your devotion to red is less than five, Purphoros isn't a creature.\nOther creatures you control have haste.\n{2}{R}: You may put a red creature card or an artifact creature card from your hand onto the battlefield. Sacrifice it at the beginning of the next end step.",
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: [],
      // Sneak Attack's shape, without the haste (Purphoros's static gives
      // other creatures haste anyway).
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature", anyOf: [{ colors: ["R"] }, { type: "artifact" }] },
        then: {
          kind: "delayed-trigger",
          at: "next-end-step",
          effect: { kind: "sacrifice-target", target: 0 },
          text: "Sacrifice the creature Purphoros put onto the battlefield.",
        },
      },
      resolve: null,
      text: "{2}{R}: You may put a red creature card or an artifact creature card from your hand onto the battlefield. Sacrifice it at the beginning of the next end step.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "devotion", colors: ["R"], atMost: 4 },
      removeTypes: ["creature"],
      text: "As long as your devotion to red is less than five, Purphoros isn't a creature.",
    },
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      grantKeywords: ["haste"],
      text: "Other creatures you control have haste.",
    },
  ],
});
