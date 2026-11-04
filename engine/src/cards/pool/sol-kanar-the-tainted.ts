import { defineCard } from "../define.js";

// Rulings:
//   In a Two-Headed Giant game, Sol'kanar the Tainted's second mode causes the opposing team to lose
//     4 life. Its controller will still gain only 2 life.
//   Once Sol'kanar the Tainted is controlled by your opponent, its ability triggers during that
//     player's end step and that player makes all choices for it.
//
// "That hasn't been chosen" is this object's (`notChosenBefore`): returned, it's a new object, and
// nothing has been chosen for it yet. The opponent is chosen as the last mode resolves.
const TEXT =
  "At the beginning of your end step, choose one that hasn't been chosen —\n• Draw a card.\n• Each opponent loses 2 life and you gain 2 life.\n• Sol'Kanar deals 3 damage to up to one other target creature or planeswalker.\n• Exile Sol'Kanar, then return it to the battlefield under an opponent's control.";

export default defineCard({
  name: "Sol'Kanar the Tainted",
  manaCost: "{2}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Demon"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        notChosenBefore: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Draw a card.", effect: { kind: "draw", amount: 1 } },
          {
            text: "Each opponent loses 2 life and you gain 2 life.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "lose-life", amount: 2, who: "each-opponent" },
                { kind: "gain-life", amount: 2 },
              ],
            },
          },
          {
            text: "Sol'Kanar deals 3 damage to up to one other target creature or planeswalker.",
            targets: [
              {
                kind: "optional",
                of: { kind: "other", of: { kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } } },
              },
            ],
            effect: { kind: "damage", amount: 3, target: 0 },
          },
          {
            text: "Exile Sol'Kanar, then return it to the battlefield under an opponent's control.",
            effect: {
              kind: "choose-opponent",
              then: { kind: "flicker", target: "source", under: "that-player" },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
