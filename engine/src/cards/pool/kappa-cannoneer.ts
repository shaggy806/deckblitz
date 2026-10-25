import { defineCard } from "../define.js";

// EDHREC rank 924.
//
// Rulings:
//   [2022-02-18] If a player casts a spell that targets multiple permanents their opponent
//     controls with ward, each of those ward abilities will trigger. If that player doesn't pay
//     for all of them, the spell will be countered.

export default defineCard({
  name: "Kappa Cannoneer",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Turtle", "Warrior"],
  power: 4,
  toughness: 4,
  improvise: true,
  text: "Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities pays for {1}.)\nWard {4}\nWhenever this creature or another artifact you control enters, put a +1/+1 counter on this creature. It can't be blocked this turn.",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{4}" } },
      resolve: null,
      text: "Ward {4}",
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Whenever this creature or another artifact you control enters, put a +1/+1 counter on this creature. It can't be blocked this turn.",
    },
  ],
});
