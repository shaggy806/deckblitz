import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// - −3: each creature's count is its colours as the ability resolves, read
//   for each target on its own.
// - −6: "if that card was all colors" asks the returned card.
const ALL_COLORS = ["W", "U", "B", "R", "G"] as const;

export default defineCard({
  name: "Jared Carthalion",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Jared"],
  loyalty: 5,
  canBeCommander: true,
  text: "+1: Create a 3/3 Kavu creature token with trample that's all colors.\n−3: Choose up to two target creatures. For each of them, put a number of +1/+1 counters on it equal to the number of colors it is.\n−6: Return target multicolored card from your graveyard to your hand. If that card was all colors, draw a card and create two Treasure tokens.\nJared Carthalion can be your commander.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Kavu Token (Jared Carthalion)", count: 1 },
      resolve: null,
      text: "+1: Create a 3/3 Kavu creature token with trample that's all colors.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: distinctTargets(2, "creature", { optional: true }),
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: { colorsOf: 0 } },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: { colorsOf: 1 } },
        ],
      },
      resolve: null,
      text: "−3: Choose up to two target creatures. For each of them, put a number of +1/+1 counters on it equal to the number of colors it is.",
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { multicolored: true } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { colors: ALL_COLORS } },
            then: {
              kind: "sequence",
              effects: [
                { kind: "draw", amount: 1 },
                { kind: "create-token", token: "Treasure Token", count: 2 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: "−6: Return target multicolored card from your graveyard to your hand. If that card was all colors, draw a card and create two Treasure tokens.",
    },
  ],
});
