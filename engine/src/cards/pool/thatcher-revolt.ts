import { defineCard } from "../define.js";

// Avacyn Restored (AVR). EDHREC rank 21394.
//
// The tokens have haste printed (not granted), so a copy of one has it too;
// `sacrificeAtEndStep` sacrifices exactly the tokens this made.

export default defineCard({
  name: "Thatcher Revolt",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Create three 1/1 red Human creature tokens with haste. Sacrifice those tokens at the beginning of the next end step.",
  targets: [],
  effect: { kind: "create-token", token: "Red Human Token (Haste)", count: 3, sacrificeAtEndStep: true },
});
