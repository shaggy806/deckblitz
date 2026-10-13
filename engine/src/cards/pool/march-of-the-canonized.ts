import { defineCard } from "../define.js";

// EDHREC rank 5150.
// Makes Vampire Demon → use "Vampire Demon Token".
// Makes Vampire → use "Lifelink Vampire Token".
//
// Rulings:
//   [2023-11-10] Mana symbols in the text boxes of permanents you control don't count toward your
//     devotion to any color.
//   [2023-11-10] March of the Canonized's last ability will trigger only if your devotion to white
//     and black is seven or greater at the beginning of your upkeep. As the triggered ability
//     tries to resolve, if your devotion to white and black is no longer at least seven, the
//     ability won't do anything.
//   [2023-11-10] Hybrid mana symbols, monocolored hybrid mana symbols, and Phyrexian mana symbols
//     do count toward your devotion to their color(s).
//   [2023-11-10] The back face of a transforming double-faced permanent has no mana cost. Mana
//     symbols on a transforming double-faced permanent's front face don't count toward your
//     devotion to any color while it's on the battlefield with its back face up.
//   [2023-11-10] Your devotion to two colors is the number of mana symbols among mana costs of
//     permanents you control that are the first color, the second, or both. If an effect counts
//     your devotion to two colors, a hybrid symbol that is both of those colors is counted just
//     once.
//   [2023-11-10] If you put an Aura on an opponent's permanent, you still control the Aura, and
//     mana symbols in its mana cost count toward your devotion.
//   [2023-11-10] Colorless and generic mana symbols ({C}, {0}, {1}, {2}, {X}, and so on) in mana
//     costs of permanents you control don't count toward your devotion to any color.

export default defineCard({
  name: "March of the Canonized",
  manaCost: "{X}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "When this enchantment enters, create X 1/1 white Vampire creature tokens with lifelink.\nAt the beginning of your upkeep, if your devotion to white and black is seven or greater, create a 4/3 white and black Vampire Demon creature token with flying.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Lifelink Vampire Token", count: "x" },
      resolve: null,
      text: "When this enchantment enters, create X 1/1 white Vampire creature tokens with lifelink.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      // An intervening if (rule 603.4): checked as it triggers and again as
      // it resolves (the ruling).
      condition: { kind: "devotion", colors: ["W", "B"], atLeast: 7 },
      targets: [],
      effect: { kind: "create-token", token: "Vampire Demon Token", count: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, if your devotion to white and black is seven or greater, create a 4/3 white and black Vampire Demon creature token with flying.",
    },
  ],
});
