import { defineCard } from "../define.js";

// EDHREC rank 15794. Mirrodin.

const TEXT = "{2}, {T}: Create a 0/1 colorless Pest artifact creature token.";

export default defineCard({
  name: "Nuisance Engine",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Pest Token (Colorless Artifact, 0/1)", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
