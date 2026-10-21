import { defineCard } from "../define.js";

export default defineCard({
  name: "Toll of the Invasion",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a nonland card from it. That player discards that card.\nAmass Zombies 1. (Put a +1/+1 counter on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
      // Amassed even when there's no nonland card to take (the ruling).
      { kind: "amass", amount: 1, creatureType: "Zombie" },
    ],
  },
});
