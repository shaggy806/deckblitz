import { defineCard } from "../define.js";

// Champions of Kamigawa. EDHREC rank 14283.
//
// Rulings:
//   Tide of War's controller always flips the coin. This means that you want to win the flip when
//     you're attacking but lose the flip when you're defending.
//   Even if the blockers are sacrificed, any attackers that were blocked are still considered
//     blocked.
//   Tide of War's ability triggers only once each combat and only if at least one blocker is
//     declared. The effect does nothing to unblocked attacking creatures.
//
// "One or more creatures block" is the `creatures-block` trigger event, once as
// the declarations complete; "each blocking/blocked creature is sacrificed by
// its controller" is every one at once, nobody choosing (`sacrifice-all`).

const TEXT =
  "Whenever one or more creatures block, flip a coin. If you win the flip, each blocking creature is sacrificed by its controller. If you lose the flip, each blocked creature is sacrificed by its controller.";

export default defineCard({
  name: "Tide of War",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "event", event: "creatures-block", batched: true },
      targets: [],
      effect: {
        kind: "flip-coin",
        won: { kind: "sacrifice-all", who: "each-player", filter: { type: "creature", blocking: true } },
        lost: { kind: "sacrifice-all", who: "each-player", filter: { type: "creature", blocked: true } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
