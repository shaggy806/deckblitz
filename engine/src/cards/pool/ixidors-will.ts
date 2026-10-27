import { defineCard } from "../define.js";

// EDHREC rank 22879. Clash of Wills's generic unless-cost, counted as it
// resolves: {2} for each Wizard on the battlefield, whoever controls it.

export default defineCard({
  name: "Ixidor's Will",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {2} for each Wizard on the battlefield.",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ payGeneric: { countOf: { subtype: "Wizard" }, times: 2 }, text: "Pay {X}" }],
    otherwise: { kind: "counter", target: 0 },
  },
});
