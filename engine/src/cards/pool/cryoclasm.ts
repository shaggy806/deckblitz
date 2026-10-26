import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 27951.

export default defineCard({
  name: "Cryoclasm",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target Plains or Island. Cryoclasm deals 3 damage to that land's controller.",
  targets: [{ kind: "permanent", filter: { subtypes: ["Plains", "Island"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "damage", amount: 3, toControllerOfTarget: 0 },
    ],
  },
});
