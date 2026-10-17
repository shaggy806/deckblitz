import { defineCard } from "../define.js";

export default defineCard({
  name: "Swarming of Moria",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")\nAmass Orcs 2. (Put two +1/+1 counters on an Army you control. It's also an Orc. If you don't control an Army, create a 0/0 black Orc Army creature token first.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Treasure Token", count: 1 },
      { kind: "amass", amount: 2, creatureType: "Orc" },
    ],
  },
});
