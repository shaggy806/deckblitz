import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 13778.
// Makes Wolf → use "Wolf Token".

export default defineCard({
  name: "Raised by Wolves",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, create two 2/2 green Wolf creature tokens.\nEnchanted creature gets +1/+1 for each Wolf you control.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 2 },
      resolve: null,
      text: "When this Aura enters, create two 2/2 green Wolf creature tokens.",
    },
  ],
  // TODO(scaffold): Enchanted creature gets +1/+1 for each Wolf you control.
});
