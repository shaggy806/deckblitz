import { defineCard } from "../define.js";

// EDHREC rank 25480.

export default defineCard({
  name: "Traitor's Clutch",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  flashback: { cost: "{1}{B}" },
  text: "Target creature gets +1/+0, becomes black, and gains shadow until end of turn. (It can block or be blocked by only creatures with shadow.)\nFlashback {1}{B} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "become-color", target: 0, colors: ["B"], duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "shadow", duration: "end-of-turn" },
    ],
  },
});
