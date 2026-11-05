import { defineCard } from "../define.js";

const REDUCE = "This spell costs {1} less to cast for each {E} (energy counter) you've paid or lost this turn.";
const ATTACK =
  "Whenever this creature attacks, you get {E}{E}, then you may pay eight {E}. When you do, this creature deals 8 damage divided as you choose among up to eight targets.";

export default defineCard({
  name: "Blaster Hulk",
  manaCost: "{6}{R}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Pirate"],
  power: 8,
  toughness: 8,
  keywords: ["haste"],
  text: `${REDUCE}\nHaste\n${ATTACK}`,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { turnStat: "energy-paid-or-lost", who: "you" },
  },
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "get-energy", amount: 2 },
          {
            kind: "may",
            prompt: "Pay eight {E} to deal 8 damage divided among up to eight targets?",
            costEnergy: 8,
            effect: {
              kind: "reflexive-trigger",
              // Each target is dealt at least 1 (the ruling), so one to eight.
              targets: [{ kind: "any-number", of: "any-target", min: 1, max: 8 }],
              divided: { total: 8, slot: 0 },
              effect: { kind: "damage-divided", from: 0 },
              text: "Blaster Hulk deals 8 damage divided as you choose among up to eight targets.",
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK,
    },
  ],
});
