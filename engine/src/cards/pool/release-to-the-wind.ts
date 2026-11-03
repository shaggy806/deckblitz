import { defineCard } from "../define.js";

export default defineCard({
  name: "Release to the Wind",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Exile target nonland permanent. For as long as that card remains exiled, its owner may cast it without paying its mana cost.",
  targets: ["nonland-permanent"],
  effect: {
    kind: "exile",
    target: 0,
    mayCast: { duration: "while-exiled", byOwner: true, free: true },
  },
});
