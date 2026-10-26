import { defineCard } from "../define.js";

// EDHREC rank 27433.
// "Sacrifice it at the beginning of the next end step" — `sacrificeAtEndStep`,
// sacrificed (not exiled) by its controller, the spell's caster.

export default defineCard({
  name: "Tidal Wave",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Create a 5/5 blue Wall creature token with defender. Sacrifice it at the beginning of the next end step.",
  targets: [],
  effect: {
    kind: "create-token",
    token: "Wall Token (5/5 blue, defender)",
    count: 1,
    sacrificeAtEndStep: true,
  },
});
