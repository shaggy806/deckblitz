import { defineCard } from "../define.js";

// EDHREC rank 16493.

export default defineCard({
  name: "Dig Site Inventory",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  flashback: { cost: "{W}" },
  text: "Put a +1/+1 counter on target creature you control. It gains vigilance until end of turn.\nFlashback {W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
    ],
  },
});
