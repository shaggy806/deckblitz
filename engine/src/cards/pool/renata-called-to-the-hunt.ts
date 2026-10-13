import { defineCard } from "../define.js";

// EDHREC rank 2952.
//
// Rulings:
//   [2020-01-24] The ability that defines Renata's power works in all zones, not just the
//     battlefield.
//   [2020-01-24] Mana symbols in the text boxes of permanents you control don't count toward your
//     devotion to any color.
//   [2020-01-24] If a creature you control would normally enter the battlefield with no +1/+1
//     counters on it, Renata's second ability causes it to enter the battlefield with a +1/+1
//     counter on it.
//   [2020-01-24] If an activated ability or triggered ability has an effect that depends on your
//     devotion to a color, you count the number of mana symbols of that color among the mana costs
//     of permanents you control as the ability resolves. The permanent with that ability will be
//     counted if it's still on the battlefield at that time.
//   [2020-01-24] If you put an Aura on an opponent's permanent, you still control the Aura, and
//     mana symbols in its mana cost count towards your devotion.
//   [2020-01-24] A creature entering the battlefield at the same time as Renata won't get an
//     additional +1/+1 counter.
//   [2020-01-24] Hybrid mana symbols, monocolored hybrid mana symbols, and Phyrexian mana symbols
//     do count toward your devotion to their color(s).
//   [2020-01-24] Colorless and generic mana symbols ({C}, {0}, {1}, {2}, {X}, and so on) in mana
//     costs of permanents you control don't count toward your devotion to any color.

export default defineCard({
  name: "Renata, Called to the Hunt",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["Demigod"],
  power: 0,
  toughness: 3,
  text: "Renata's power is equal to your devotion to green. (Each {G} in the mana costs of permanents you control counts toward your devotion to green.)\nEach other creature you control enters with an additional +1/+1 counter on it.",
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { devotionTo: ["G"] }, plusPower: 0, plusToughness: 0, only: "power" },
      text: "Renata's power is equal to your devotion to green.",
    },
    {
      // Giada's replacement: never Renata itself, nor anything entering with
      // her (rule 614.12, the ruling).
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", controlledBy: "you" },
        counters: { kind: "+1/+1", amount: 1 },
      },
      text: "Each other creature you control enters with an additional +1/+1 counter on it.",
    },
  ],
});
