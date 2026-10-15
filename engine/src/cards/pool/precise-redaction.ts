import { defineCard } from "../define.js";

// EDHREC rank 27498.
export default defineCard({
  name: "Precise Redaction",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target white or black spell.",
  targets: [{ kind: "spell", filter: { anyOf: [{ colors: ["W"] }, { colors: ["B"] }] } }],
  effect: { kind: "counter", target: 0 },
});
