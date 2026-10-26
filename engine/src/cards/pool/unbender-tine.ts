import { defineCard } from "../define.js";

// EDHREC rank 16254. Ioreth of the Healing House's untap.

export default defineCard({
  name: "Unbender Tine",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["artifact"],
  text: "{T}: Untap another target permanent.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "other", of: "permanent" }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: "{T}: Untap another target permanent.",
    },
  ],
});
