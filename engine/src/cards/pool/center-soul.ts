import { defineCard } from "../define.js";

// EDHREC rank 16828.

export default defineCard({
  name: "Center Soul",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  rebound: true,
  text: "Target creature you control gains protection from the color of your choice until end of turn.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  targets: ["creature-you-control"],
  effect: { kind: "grant-protection", target: 0, from: { choose: "color" }, duration: "end-of-turn" },
});
