import { defineCard } from "../define.js";

export default defineCard({
  name: "Gainsay",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target blue spell.",
  targets: [{ kind: "spell", filter: { colors: ["U"] } }],
  effect: { kind: "counter", target: 0 },
});
