import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 26778.
//
// Every Plains is destroyed at once; then one question per land destroyed
// this way, asked of its controller as it left, in turn order (rule 101.4):
// pay {2}, or Stench of Evil deals them 1 damage. A player with three Plains
// destroyed may pay for some and not others.

export default defineCard({
  name: "Stench of Evil",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy all Plains. For each land destroyed this way, Stench of Evil deals 1 damage to that land's controller unless they pay {2}.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { subtype: "Plains" } },
      {
        kind: "for-each-unless",
        of: { thisWay: "destroyed", filter: { type: "land" } },
        asks: "controller",
        options: [{ pay: "{2}", text: "Pay {2} for {it}" }],
        otherwise: { kind: "damage", amount: 1, who: "that-player" },
      },
    ],
  },
});
