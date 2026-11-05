import { defineCard } from "../define.js";

const TEXT =
  "Pack tactics — Whenever this creature attacks, if you attacked with creatures with total power 6 or greater this combat, you may sacrifice another creature. When you do, this creature deals damage equal to the sacrificed creature's power to target creature.";

export default defineCard({
  name: "Tiger-Tribe Hunter",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Barbarian"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "turn-stat", stat: "power-attacked-with-this-combat", who: "you", atLeast: 6 },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["creature"],
          value: { powerOf: "sacrificed" },
          effect: { kind: "damage", target: 0, amount: { triggerValue: true } },
          text: "When you do, this creature deals damage equal to the sacrificed creature's power to target creature.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
