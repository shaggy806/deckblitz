import { defineCard } from "../define.js";

// Champions of Kamigawa.

export default defineCard({
  name: "Hisoka's Defiance",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target Spirit or Arcane spell.",
  targets: [{ kind: "spell", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } }],
  effect: { kind: "counter", target: 0 },
});
