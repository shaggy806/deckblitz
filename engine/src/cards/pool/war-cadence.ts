import { defineCard } from "../define.js";

const TEXT = "{X}{R}: This turn, creatures can't block unless their controller pays {X} for each blocking creature they control.";

// War Tax's block twin: every block by anyone, each activation adding up, X
// fixed as the ability resolves (rule 611.2b).
export default defineCard({
  name: "War Cadence",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}{R}", tap: false },
      targets: [],
      effect: { kind: "player-effect", duration: "end-of-turn", blockTax: { generic: "x" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
