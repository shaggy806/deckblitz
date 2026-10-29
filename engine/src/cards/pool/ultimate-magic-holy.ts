import { defineCard } from "../define.js";

// EDHREC rank 2646.
//
// - "If this spell was cast from exile" is Delayed Blast Fireball's
//   `source` condition on `castFrom: "exile"` (a foretold cast is one).
export default defineCard({
  name: "Ultimate Magic: Holy",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Permanents you control gain indestructible until end of turn. If this spell was cast from exile, prevent all damage that would be dealt to you this turn.\nForetell {2}{W} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  foretell: { cost: "{2}{W}" },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword-all", filter: { controlledBy: "you" }, keyword: "indestructible", duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { castFrom: "exile" } },
        then: { kind: "damage-rule", to: { players: "you" } },
      },
    ],
  },
});
