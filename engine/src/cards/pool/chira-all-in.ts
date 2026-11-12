import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. Each of the five is one `acted-at-random`
// event per instruction — a flip of three coins is one flip, a roll of two dice
// one roll — so it triggers once for each (`acts-at-random`).
const TEXT =
  "Whenever you discard one or more cards at random, select one or more targets at random, choose one or more modes at random, flip one or more coins, or roll one or more dice, put a +1/+1 counter on Chira and create a tapped Treasure token.";

export default defineCard({
  name: "Chira, All In",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "event", event: "acts-at-random", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "create-token", token: "Treasure Token", count: 1, tapped: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
