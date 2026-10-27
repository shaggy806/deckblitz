import { defineCard } from "../define.js";

// Prophecy. EDHREC rank 24022. The creature's controller chooses whether to
// pay as the ability resolves (the ruling) — Vectis Dominator's punisher.

const TEXT = "{U}: Tap target creature unless its controller pays {1}.";

export default defineCard({
  name: "Rhystic Deluge",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: ["creature"],
      effect: { kind: "unless", chooser: 0, options: [{ pay: "{1}", text: "Pay {1}" }], otherwise: { kind: "tap", target: 0 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
