import { defineCard } from "../define.js";

// Rulings:
//   [2012-05-01] You can't pay more life than you have.
//   [2012-05-01] A player may choose to pay life for some creatures and sacrifice the rest. It's not
//     an all-or-nothing decision.
//   [2012-05-01] If you can't sacrifice a creature (perhaps because of Sigarda, Host of Herons), you
//     can choose not to pay life and nothing will happen.
//   [2012-05-01] First, the active player chooses whether to pay X life for each creature they
//     control. Then each other player in turn order chooses for their creatures. Then each player
//     pays life and sacrifices creatures at the same time. Players will know the decisions of
//     players who chose before them.

export default defineCard({
  name: "Killing Wave",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "For each creature, its controller sacrifices it unless they pay X life.",
  effect: {
    kind: "for-each-unless",
    of: { permanents: { type: "creature" } },
    asks: "controller",
    options: [{ payLifeAmount: "x", text: "Pay {X} life to keep {it}" }],
    otherwise: { kind: "sacrifice-target", target: 0, byItsController: true },
  },
});
