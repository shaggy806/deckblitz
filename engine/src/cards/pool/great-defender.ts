import { defineCard } from "../define.js";

// EDHREC rank 29742.

export default defineCard({
  name: "Great Defender",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +0/+X until end of turn, where X is its mana value.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 0, toughness: { manaValueOf: 0 }, duration: "end-of-turn" },
});
