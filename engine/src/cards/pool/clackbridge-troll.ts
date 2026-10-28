import { defineCard } from "../define.js";

// EDHREC rank 5395.
//
// Desecration Demon's shape: each opponent in turn order may sacrifice a
// creature, and the payoff happens once if any did (`this-way` sacrificed, read
// after everyone chose — the ruling), never for a sacrifice made any other way.
const ETB_TEXT = "When this creature enters, target opponent creates three 0/1 white Goat creature tokens.";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, any opponent may sacrifice a creature of their choice. If a player does, tap this creature, you gain 3 life, and you draw a card.";

export default defineCard({
  name: "Clackbridge Troll",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 8,
  toughness: 8,
  keywords: ["trample", "haste"],
  text: `Trample, haste\n${ETB_TEXT}\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "create-token", token: "Goat Token", count: 3, who: "target-controller" },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
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
                { kind: "gain-life", amount: 3 },
                { kind: "draw", amount: 1 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
