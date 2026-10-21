import { defineCard } from "../define.js";

// EDHREC rank 18324.

export default defineCard({
  name: "Flash Counter",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target instant spell.",
  targets: [{ kind: "spell", filter: { type: "instant" } }],
  effect: { kind: "counter", target: 0 },
});
