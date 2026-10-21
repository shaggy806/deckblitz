import { defineCard } from "../define.js";

export default defineCard({
  name: "Invade the City",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: "Amass Zombies X, where X is the number of instant and sorcery cards in your graveyard. (Put X +1/+1 counters on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)",
  targets: [],
  // Counted as it resolves, while this spell is still on the stack; a card
  // that's both an instant and a sorcery counts once (the rulings).
  effect: {
    kind: "amass",
    amount: { countInGraveyard: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" } },
    creatureType: "Zombie",
  },
});
