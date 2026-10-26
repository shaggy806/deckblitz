import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 30285.

export default defineCard({
  name: "Frazzle",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target nonblue spell.",
  targets: [{ kind: "spell", filter: { notColors: ["U"] } }],
  effect: { kind: "counter", target: 0 },
});
