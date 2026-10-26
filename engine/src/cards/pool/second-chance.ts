import { defineCard } from "../define.js";

// EDHREC rank 20720.
//
// Rulings:
//   [2004-10-04] It is not optional.
//   [2004-10-04] The ability will only trigger if you have 5 or less life at the beginning of
//     upkeep. This is checked again at the start of resolution and nothing happens if you do not
//     still have 5 or less life.
//   [2010-06-15] If you can't sacrifice this card (because it is not on the battlefield, for
//     example), then you still take an extra turn after this one.

const TEXT =
  "At the beginning of your upkeep, if you have 5 or less life, sacrifice this enchantment and take an extra turn after this one.";

export default defineCard({
  name: "Second Chance",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "life-total", who: "you", atMost: 5 },
      targets: [],
      effect: { kind: "sequence", effects: [{ kind: "sacrifice-source" }, { kind: "take-extra-turn" }] },
      resolve: null,
      text: TEXT,
    },
  ],
});
