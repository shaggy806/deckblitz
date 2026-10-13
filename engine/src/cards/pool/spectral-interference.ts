import { defineCard } from "../define.js";

// EDHREC rank 11290.

export default defineCard({
  name: "Spectral Interference",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target artifact or creature spell unless its controller pays {4}.",
  targets: [{ kind: "spell", filter: { typesAnyOf: ["artifact", "creature"] } }],
  effect: { kind: "unless", chooser: 0, options: [{ pay: "{4}", text: "Pay {4}" }], otherwise: { kind: "counter", target: 0 } },
});
