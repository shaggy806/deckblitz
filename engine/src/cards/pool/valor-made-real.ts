import { defineCard } from "../define.js";

// EDHREC rank 11528.
//
// The `block-additional` effect with `"any"`.

export default defineCard({
  name: "Valor Made Real",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature can block any number of creatures this turn.",
  targets: ["creature"],
  effect: { kind: "block-additional", target: 0, amount: "any", duration: "end-of-turn" },
});
