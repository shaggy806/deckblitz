import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 19750. Chromatic Star's trigger, three cards.

const TEXT = "When this enchantment is put into a graveyard from the battlefield, draw three cards.";

export default defineCard({
  name: "Hatching Plans",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "draw", amount: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
