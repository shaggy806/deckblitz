import { defineCard } from "../define.js";

// The Lost Caverns of Ixalan. Brotherhood's End's sweep, X read as it
// resolves: the Caves you control plus the Cave cards in your graveyard.

export default defineCard({
  name: "Calamitous Cave-In",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Calamitous Cave-In deals X damage to each creature and each planeswalker, where X is the number of Caves you control plus the number of Cave cards in your graveyard.",
  effect: {
    kind: "damage-all",
    filter: { typesAnyOf: ["creature", "planeswalker"] },
    amount: {
      sum: [
        { countOf: { subtype: "Cave", controlledBy: "you" } },
        { countInGraveyard: { subtype: "Cave", ownedBy: "you" } },
      ],
    },
  },
});
