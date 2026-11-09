import { defineCard } from "../define.js";

// EDHREC rank 14808. Chapter II lasts indefinitely (its ruling); chapter III's
// creatures are each their own source.

const ONE = "I — Create a 2/2 blue Shapeshifter creature token with changeling.";
const TWO = "II — Any number of target Shapeshifter creatures you control have base power and toughness 4/4.";
const THREE =
  "III — Choose up to one target creature or planeswalker. Each creature with power 4 or greater you control deals damage equal to its power to that permanent.";

export default defineCard({
  name: "The Bears of Littjara",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${ONE}\n${TWO}\n${THREE}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "Shapeshifter Token (Blue)", count: 1 },
      resolve: null,
      text: ONE,
    },
    {
      at: [2],
      targets: [{ kind: "any-number", of: { kind: "permanent", whose: "you", filter: { type: "creature", subtype: "Shapeshifter" } } }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "become", target: 0, power: 4, toughness: 4, duration: "permanent" },
      },
      resolve: null,
      text: TWO,
    },
    {
      at: [3],
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } } }],
      effect: {
        kind: "each-deals-damage",
        filter: { type: "creature", controlledBy: "you", power: { op: "gte", n: 4 } },
        amount: "its-power",
        to: 0,
      },
      resolve: null,
      text: THREE,
    },
  ],
});
