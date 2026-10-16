import { defineCard } from "../define.js";

// Rulings:
//   [2024-07-05] Once an Assassin creature or commander you control deals combat damage to a player
//     in a turn, you can cast spells for their freerunning costs for the rest of that turn. It
//     doesn't matter what happens to that Assassin or commander after that.
//   [2024-07-05] If the target creature is a legal target but isn't destroyed, most likely because
//     it has indestructible, you'll still draw a card if another creature died this turn.
//   [2024-07-05] If the target creature is an illegal target by the time Chain Assassination tries
//     to resolve, it won't resolve and none of its effects will happen. You won't draw a card even
//     if another creature has died this turn.

export default defineCard({
  name: "Chain Assassination",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Freerunning {1}{B} (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)\nDestroy target creature. If another creature died this turn, draw a card.",
  freerunning: { cost: "{1}{B}" },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        // "Another creature": one other than the target. If the target died
        // this way, a second death this turn is needed; if it survived
        // (indestructible — the ruling), any creature's death this turn counts.
        kind: "conditional",
        condition: {
          kind: "any",
          of: [
            {
              kind: "all",
              of: [
                { kind: "this-way", what: "died" },
                { kind: "turn-history", what: "died", who: "any-player", atLeast: 2 },
              ],
            },
            {
              kind: "all",
              of: [
                { kind: "not", of: { kind: "this-way", what: "died" } },
                { kind: "turn-history", what: "died", who: "any-player", atLeast: 1 },
              ],
            },
          ],
        },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
