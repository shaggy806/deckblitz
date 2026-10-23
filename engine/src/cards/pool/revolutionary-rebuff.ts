import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 22296.
export default defineCard({
  name: "Revolutionary Rebuff",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target nonartifact spell unless its controller pays {2}.",
  targets: [{ kind: "spell", filter: { notTypes: ["artifact"] } }],
  effect: { kind: "unless", chooser: 0, options: [{ pay: "{2}", text: "Pay {2}" }], otherwise: { kind: "counter", target: 0 } },
});
