import { defineCard } from "../define.js";

// EDHREC rank 2282.
//
// Rulings: the additional beginning phase is a lot like your normal one —
// permanents phase and untap, "at the beginning of your upkeep" triggers,
// you draw — then the game proceeds to the ending phase. It all happens
// during the current turn: "until your next turn" doesn't end. Each main
// phase other than the first is a postcombat main phase, and it triggers at
// the beginning of each.
const TEXT =
  "Flying\nAt the beginning of each of your postcombat main phases, there is an additional beginning phase after this phase. (The beginning phase includes the untap, upkeep, and draw steps.)";

export default defineCard({
  name: "Sphinx of the Second Sun",
  manaCost: "{6}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "postcombat-main", who: "you" },
      targets: [],
      effect: { kind: "additional-beginning-phase" },
      resolve: null,
      text: "At the beginning of each of your postcombat main phases, there is an additional beginning phase after this phase.",
    },
  ],
});
