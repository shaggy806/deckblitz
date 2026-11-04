import { defineCard } from "../define.js";

// The Lord of the Rings: Tales of Middle-earth.

export default defineCard({
  name: "Surrounded by Orcs",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Amass Orcs 3, then target player mills X cards, where X is the amassed Army's power. (To amass Orcs 3, put three +1/+1 counters on an Army you control. It's also an Orc. If you don't control an Army, create a 0/0 black Orc Army creature token first.)",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "amass", amount: 3, creatureType: "Orc" },
      { kind: "mill", target: 0, amount: { powerOf: "amassed" } },
    ],
  },
});
