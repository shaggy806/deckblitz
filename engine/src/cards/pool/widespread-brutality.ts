import { defineCard } from "../define.js";

// War of the Spark. The Army is the source of the damage, so its lifelink, deathtouch and the rest
// apply.

export default defineCard({
  name: "Widespread Brutality",
  manaCost: "{1}{B}{R}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Amass Zombies 2, then the Army you amassed deals damage equal to its power to each non-Army creature. (To amass Zombies 2, put two +1/+1 counters on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "amass", amount: 2, creatureType: "Zombie" },
      {
        kind: "damage-all",
        filter: { type: "creature", notSubtypes: ["Army"] },
        amount: { powerOf: "amassed" },
        from: "amassed",
      },
    ],
  },
});
