import { defineCard } from "../define.js";

// EDHREC rank 8662.
//
// Rulings:
//   [2013-01-24] Token creatures that are a copy of Biovisionary will count.
//   [2013-01-24] If the ability does trigger, but you don't control four or more creatures named
//     Biovisionary when the ability tries to resolve, the ability will do nothing.
//   [2013-01-24] If you don't control four or more creatures named Biovisionary at the beginning
//     of the end step, the ability won't trigger.
// The intervening-if (rule 603.4) is the trigger's `condition`, checked as it
// triggers and again as it resolves. `name` reads the printed name, which a
// copy takes (layer 1), so token copies count.

const TEXT =
  "At the beginning of the end step, if you control four or more creatures named Biovisionary, you win the game.";

export default defineCard({
  name: "Biovisionary",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "controls", filter: { type: "creature", name: "Biovisionary" }, atLeast: 4 },
      targets: [],
      effect: { kind: "win-game" },
      resolve: null,
      text: TEXT,
    },
  ],
});
