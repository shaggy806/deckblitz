import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 9048.
//
// The −3 gains life equal to the destroyed creature's toughness as it last
// existed on the battlefield; an illegal target fizzles the whole ability
// (no life). The emblem goes to the targeted opponent, and its "attacks you"
// is a creature attacking that player — never one of their planeswalkers
// (the rulings).

const EMBLEM = "Whenever a creature attacks you, it gets +5/+5 and gains trample until end of turn.";

export default defineCard({
  name: "Garruk, Apex Predator",
  manaCost: "{5}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Garruk"],
  loyalty: 5,
  text: "+1: Destroy another target planeswalker.\n+1: Create a 3/3 black Beast creature token with deathtouch.\n−3: Destroy target creature. You gain life equal to its toughness.\n−8: Target opponent gets an emblem with \"Whenever a creature attacks you, it gets +5/+5 and gains trample until end of turn.\"",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "planeswalker" } } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "+1: Destroy another target planeswalker.",
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Beast Token (Black, Deathtouch)", count: 1 },
      resolve: null,
      text: "+1: Create a 3/3 black Beast creature token with deathtouch.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "gain-life", amount: { toughnessOf: 0 } },
        ],
      },
      resolve: null,
      text: "−3: Destroy target creature. You gain life equal to its toughness.",
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: ["opponent"],
      effect: {
        kind: "create-emblem",
        text: EMBLEM,
        to: 0,
        triggered: [
          {
            trigger: { on: "attacks", who: "any", attackingYou: true, defender: "player", filter: { type: "creature" } },
            targets: [],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "modify-pt", target: "trigger-object", power: 5, toughness: 5, duration: "end-of-turn" },
                { kind: "grant-keyword", target: "trigger-object", keyword: "trample", duration: "end-of-turn" },
              ],
            },
            resolve: null,
            text: EMBLEM,
          },
        ],
      },
      resolve: null,
      text: "−8: Target opponent gets an emblem with \"Whenever a creature attacks you, it gets +5/+5 and gains trample until end of turn.\"",
    },
  ],
});
