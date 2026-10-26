import { defineCard } from "../define.js";

// Each opponent in turn order may sacrifice a creature (even after another
// did — the ruling); the Demon is tapped and gets one counter at most, however
// many were sacrificed (`this-way` sacrificed, once, after everyone chose).
const TEXT =
  "At the beginning of each combat, any opponent may sacrifice a creature of their choice. If a player does, tap this creature and put a +1/+1 counter on it.";

export default defineCard({
  name: "Desecration Demon",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "each-player-may",
            who: "each-opponent",
            options: [{ sacrifice: { type: "creature", controlledBy: "you" }, text: "Sacrifice a creature" }],
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", atLeast: 1 },
            then: {
              kind: "sequence",
              effects: [
                { kind: "tap", target: "source" },
                { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
