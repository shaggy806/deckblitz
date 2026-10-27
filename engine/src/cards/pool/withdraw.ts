import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 23712.
//
// Two different target creatures (`distinctTargets`, the ruling), the second
// the one its controller may pay {1} for, as the spell resolves (`unless`,
// chooser slot 1 — Erratic Portal's shape). The two may have different
// controllers.

export default defineCard({
  name: "Withdraw",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target creature to its owner's hand. Then return another target creature to its owner's hand unless its controller pays {1}.",
  targets: distinctTargets(2, "creature"),
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "unless", chooser: 1, options: [{ pay: "{1}", text: "Pay {1}" }], otherwise: { kind: "return-to-hand", target: 1 } },
    ],
  },
});
