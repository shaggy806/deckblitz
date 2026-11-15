import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 27376.

const END_TEXT =
  "At the beginning of each end step, if you faced a dilemma this turn, target opponent exiles cards from the top of their library until they exile a nonland card. You may cast that card without paying its mana cost. (You face a dilemma as you choose one or more modes for a spell or ability.)";

// "If you faced a dilemma this turn" is an intervening if (rule 603.4),
// checked as the end step begins and again on resolution.
export default defineCard({
  name: "The Caretaker",
  manaCost: "{5}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 6,
  keywords: ["vigilance"],
  text: `Vigilance, ward {2}\n${END_TEXT}`,
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-stat", stat: "dilemmas-faced", who: "you", atLeast: 1 },
      targets: ["opponent"],
      effect: {
        kind: "reveal-until",
        whose: 0,
        filter: { notTypes: ["land"] },
        exile: true,
        then: { kind: "cast-now", target: 0, free: true },
        rest: "stay",
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
