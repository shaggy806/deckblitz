import { defineCard } from "../define.js";

// EDHREC rank 32207.

export default defineCard({
  name: "Parallax Inhibitor",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{1}, {T}, Sacrifice this artifact: Put a fade counter on each permanent with fading you control.",
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "add-counter-all", filter: { hasKeyword: "fading", controlledBy: "you" }, counter: "fade", amount: 1 },
      resolve: null,
      text: "{1}, {T}, Sacrifice this artifact: Put a fade counter on each permanent with fading you control.",
    },
  ],
});
