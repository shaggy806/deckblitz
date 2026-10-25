import { defineCard } from "../define.js";

// Mirage. EDHREC rank 18103.

export default defineCard({
  name: "Teferi's Isle",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  keywords: ["phasing"],
  text: "Phasing (This phases in or out before you untap during each of your untap steps. While it's phased out, it's treated as though it doesn't exist.)\nTeferi's Isle enters tapped.\n{T}: Add {U}{U}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 2 },
      resolve: null,
      text: "{T}: Add {U}{U}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "Teferi's Isle enters tapped.",
    },
  ],
});
