import { defineCard } from "../define.js";

// EDHREC rank 14281.
// Makes Goblin Army by amassing → the engine's "Army Token" (amass adds Goblin).
//
// "If this spell was cast from a graveyard" reads the spell's own cast
// origin — flashback, or any other permission to cast it from a graveyard.
export default defineCard({
  name: "Tidings of War",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashback: { cost: "{3}{R}" },
  text:
    "Amass Goblins 1. If this spell was cast from a graveyard, amass Goblins 3 instead. (To amass Goblins X, put X +1/+1 counters on an Army you control. It's also a Goblin. If you don't control an Army, create a 0/0 black Goblin Army creature token first.)\n" +
    "Flashback {3}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "amass",
    amount: { ifCondition: { kind: "source", filter: { castFrom: "graveyard" } }, then: 3, else: 1 },
    creatureType: "Goblin",
  },
});
