import { defineCard } from "../define.js";

// Rulings:
//   If creatures you control deal combat damage to multiple players at the same time, Heroes in a
//     Half Shell's last ability will trigger for each of those players. When one of those abilities
//     resolves, it will put counters only on Mutants, Ninjas, and/or Turtles that dealt combat
//     damage to the appropriate player.

const TEXT =
  "Whenever one or more Mutants, Ninjas, and/or Turtles you control deal combat damage to a player, put a +1/+1 counter on each of those creatures and draw a card.";

export default defineCard({
  name: "Heroes in a Half Shell",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 5,
  toughness: 5,
  keywords: ["vigilance", "menace", "trample", "haste"],
  text: `Vigilance, menace, trample, haste\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "deals-damage-batch",
        who: "you-control",
        filter: { subtypes: ["Mutant", "Ninja", "Turtle"] },
        combat: true,
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter-all", filter: { inSet: "trigger-batch" }, counter: "+1/+1", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
