import { defineCard } from "../define.js";

export default defineCard({
  name: "Bleeding Edge",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Up to one target creature gets -2/-2 until end of turn. Amass Zombies 2. (Put two +1/+1 counters on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)",
  targets: [{ kind: "optional", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      { kind: "amass", amount: 2, creatureType: "Zombie" },
    ],
  },
});
