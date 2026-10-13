import { defineCard } from "../define.js";

// EDHREC rank 4253.
//
// Rulings:
//   [2020-01-24] Erebos’s last ability can target the creature you’ll sacrifice to pay its cost.
//     In this case, the ability won’t resolve, but Erebos’s triggered ability will trigger.
//   [2020-01-24] Counters put on a God remain on it while it’s not a creature, even if they have
//     no effect.
//   [2020-01-24] If one or more creatures you control die at the same time as Erebos, its
//     triggered ability triggers for each of those creatures.
//   [2020-01-24] Mana symbols in the text boxes of permanents you control don’t count toward your
//     devotion to any color.
//   [2020-01-24] If an effect causes a God to lose all abilities, its ability that causes it to
//     stop being a creature still applies if appropriate.
//   [2020-01-24] When a God enters the battlefield, your devotion to its color (including the mana
//     symbols in the mana cost of the God itself) will determine if a creature entered the
//     battlefield or not for abilities that trigger whenever a creature enters the battlefield.
//   [2020-01-24] As a God enters the battlefield, your devotion to its color will determine
//     whether any replacement effects that affect creatures entering the battlefield apply to that
//     God. Because replacement effects are considered before the God is on the battlefield, the
//     mana symbols in its mana cost won’t be counted when determining this.
//   [2020-01-24] If you put an Aura on an opponent’s permanent, you still control the Aura, and
//     mana symbols in its mana cost count towards your devotion.
//   [2020-01-24] While resolving Erebos’s triggered ability, you can’t pay more than 2 life to
//     draw more than one card.
//   [2020-01-24] If a God stops being a creature, it loses the type creature and the creature type
//     God. It continues to be a legendary enchantment.
//   [2020-01-24] Colorless and generic mana symbols ({C}, {0}, {1}, {2}, {X}, and so on) in mana
//     costs of permanents you control don’t count toward your devotion to any color.
//   [2020-01-24] The abilities of Gods function as long as they’re on the battlefield, regardless
//     of whether they’re creatures.
//   [2020-01-24] If a God is attacking or blocking and it stops being a creature, it will be
//     removed from combat. It won’t rejoin combat if it resumes being a creature later during that
//     combat.
//   [2020-01-24] If an activated ability or triggered ability has an effect that depends on your
//     devotion to a color, you count the number of mana symbols of that color among the mana costs
//     of permanents you control as the ability resolves. The permanent with that ability will be
//     counted if it’s still on the battlefield at that time.
//   [2020-01-24] Hybrid mana symbols, monocolored hybrid mana symbols, and Phyrexian mana symbols
//     do count toward your devotion to their color(s).
//   [2020-01-24] The type-changing ability that can make a God not be a creature functions only on
//     the battlefield. It’s always a creature card in other zones, regardless of your devotion to
//     its color. It’s always a creature spell while it’s on the stack.

export default defineCard({
  name: "Erebos, Bleak-Hearted",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 5,
  toughness: 6,
  keywords: ["indestructible"],
  text: "Indestructible\nAs long as your devotion to black is less than five, Erebos isn't a creature.\nWhenever another creature you control dies, you may pay 2 life. If you do, draw a card.\n{1}{B}, Sacrifice another creature: Target creature gets -2/-1 until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "creature-you-control" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{B}, Sacrifice another creature: Target creature gets -2/-1 until end of turn.",
      otherOnly: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      // Crossway Troublemakers' optional life payment.
      effect: { kind: "may", prompt: "Pay 2 life to draw a card?", costLife: 2, effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "Whenever another creature you control dies, you may pay 2 life. If you do, draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "devotion", colors: ["B"], atMost: 4 },
      removeTypes: ["creature"],
      text: "As long as your devotion to black is less than five, Erebos isn't a creature.",
    },
  ],
});
