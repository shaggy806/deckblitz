import { defineCard } from "../define.js";

// EDHREC rank 5186.
//
// Rulings:
//   [2020-01-24] The abilities of Gods function as long as they’re on the battlefield, regardless
//     of whether they’re creatures.
//   [2020-01-24] Hybrid mana symbols, monocolored hybrid mana symbols, and Phyrexian mana symbols
//     do count toward your devotion to their color(s).
//   [2020-01-24] If the target card in a graveyard is an illegal target by the time Klothys’s last
//     ability tries to resolve, the ability won’t resolve. You won’t add mana, gain life, or deal
//     damage.
//   [2020-01-24] If you exile a nonland card, you gain only 2 life, no matter how many opponents
//     are dealt damage.
//   [2020-01-24] If you put an Aura on an opponent’s permanent, you still control the Aura, and
//     mana symbols in its mana cost count towards your devotion.
//   [2020-01-24] If a God is attacking or blocking and it stops being a creature, it will be
//     removed from combat. It won’t rejoin combat if it resumes being a creature later during that
//     combat.
//   [2020-01-24] As a God enters the battlefield, your devotion to its color will determine
//     whether any replacement effects that affect creatures entering the battlefield apply to that
//     God. Because replacement effects are considered before the God is on the battlefield, the
//     mana symbols in its mana cost won’t be counted when determining this.
//   [2020-01-24] The type-changing ability that can make a God not be a creature functions only on
//     the battlefield. It’s always a creature card in other zones, regardless of your devotion to
//     its color. It’s always a creature spell while it’s on the stack.
//   [2020-01-24] If you exile a land card that has another card type (such as an artifact land),
//     you add one mana, but you won’t gain life or deal damage.
//   [2020-01-24] If an activated ability or triggered ability has an effect that depends on your
//     devotion to a color, you count the number of mana symbols of that color among the mana costs
//     of permanents you control as the ability resolves. The permanent with that ability will be
//     counted if it’s still on the battlefield at that time.
//   [2020-01-24] Your devotion to two colors is the number of mana symbols among mana costs of
//     permanents you control that are the first color, the second, or both. If an effect counts
//     your devotion to two colors, a hybrid symbol that is both of those colors is counted just
//     once.
//   [2020-01-24] If an effect causes a God to lose all abilities, its ability that causes it to
//     stop being a creature still applies if appropriate.
//   [2020-01-24] When a God enters the battlefield, your devotion to its color (including the mana
//     symbols in the mana cost of the God itself) will determine if a creature entered the
//     battlefield or not for abilities that trigger whenever a creature enters the battlefield.
//   [2020-01-24] Colorless and generic mana symbols ({C}, {0}, {1}, {2}, {X}, and so on) in mana
//     costs of permanents you control don’t count toward your devotion to any color.
//   [2020-01-24] In a Two-Headed Giant game, Klothys’s last ability causes the opposing team to
//     lose 4 life and you gain 2 life.
//   [2020-01-24] Mana symbols in the text boxes of permanents you control don’t count toward your
//     devotion to any color.
//   [2020-01-24] If a God stops being a creature, it loses the type creature and the creature type
//     God. It continues to be a legendary enchantment.
//   [2020-01-24] Counters put on a God remain on it while it’s not a creature, even if they have
//     no effect.

export default defineCard({
  name: "Klothys, God of Destiny",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 4,
  toughness: 5,
  keywords: ["indestructible"],
  text: "Indestructible\nAs long as your devotion to red and green is less than seven, Klothys isn't a creature.\nAt the beginning of your first main phase, exile target card from a graveyard. If it was a land card, add {R} or {G}. Otherwise, you gain 2 life and Klothys deals 2 damage to each opponent.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      // The card is read in exile, where it went (Scavenging Ooze's shape): a
      // land card — an artifact land too — makes mana, anything else the
      // life and damage (the rulings). The mana is asked as it resolves.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { type: "land" } },
            then: { kind: "add-mana", mana: { oneOf: ["R", "G"] }, amount: 1 },
            else: {
              kind: "sequence",
              effects: [
                { kind: "gain-life", amount: 2 },
                { kind: "damage", amount: 2, who: "each-opponent" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: "At the beginning of your first main phase, exile target card from a graveyard. If it was a land card, add {R} or {G}. Otherwise, you gain 2 life and Klothys deals 2 damage to each opponent.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "devotion", colors: ["R", "G"], atMost: 6 },
      removeTypes: ["creature"],
      text: "As long as your devotion to red and green is less than seven, Klothys isn't a creature.",
    },
  ],
});
