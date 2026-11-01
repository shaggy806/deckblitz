import { defineCard } from "../define.js";

const TEXT = "{X}{U}: This turn, creatures can't attack unless their controller pays {X} for each attacking creature they control.";

// Every creature on every attack, its controller's own too, and each
// activation adds up; X is fixed as the ability resolves (rule 611.2b).
export default defineCard({
  name: "War Tax",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}{U}", tap: false },
      targets: [],
      effect: { kind: "player-effect", duration: "end-of-turn", attackTax: { generic: "x", covers: "all" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
