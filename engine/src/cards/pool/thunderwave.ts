import { defineCard } from "../define.js";

// The 10-19 row's choice isn't a target: any creature can be chosen as it
// resolves, hexproof or not, or none at all.
export default defineCard({
  name: "Thunderwave",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "Roll a d20.\n" +
    "1—9 | Thunderwave deals 3 damage to each creature.\n" +
    "10—19 | You may choose a creature. Thunderwave deals 3 damage to each creature not chosen this way.\n" +
    "20 | Thunderwave deals 6 damage to each creature your opponents control.",
  targets: [],
  effect: {
    kind: "roll-dice",
    sides: 20,
    table: [
      { min: 1, max: 9, effect: { kind: "damage-all", amount: 3, filter: { type: "creature" } } },
      {
        min: 10,
        max: 19,
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "vote",
              choose: true,
              who: "you",
              for: {
                permanent: { type: "creature" },
                upTo: 1,
                keep: true,
                prompt: "You may choose a creature — the rest are dealt 3 damage",
              },
            },
            { kind: "damage-all", amount: 3, filter: { type: "creature", notThisWay: "chosen" } },
          ],
        },
      },
      { min: 20, effect: { kind: "damage-all", amount: 6, filter: { type: "creature", controlledBy: "opponent" } } },
    ],
  },
});
