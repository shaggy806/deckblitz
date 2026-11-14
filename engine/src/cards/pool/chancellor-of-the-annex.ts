import { defineCard } from "../define.js";

// - Revealed, it watches for the rest of the game, firing once for each
//   opponent's first spell of the game (rule 603.7, the rulings); two revealed
//   make that player pay {1} twice. A copy is never cast (rule 707.10).

const REVEAL =
  "You may reveal this card from your opening hand. If you do, when each opponent casts their first spell of the game, counter that spell unless that player pays {1}.";
const TAX = "Whenever an opponent casts a spell, counter it unless that player pays {1}.";

const COUNTER_UNLESS_ONE = {
  kind: "unless",
  chooser: "trigger-controller",
  options: [{ pay: "{1}", text: "Pay {1}" }],
  otherwise: { kind: "counter", target: "trigger-object" },
} as const;

export default defineCard({
  name: "Chancellor of the Annex",
  manaCost: "{4}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Angel"],
  power: 5,
  toughness: 6,
  keywords: ["flying"],
  text: `${REVEAL}\nFlying\n${TAX}`,
  openingHandReveal: {
    at: { whenever: { on: "cast-spell", who: "opponent", nthThisGame: 1 } },
    effect: COUNTER_UNLESS_ONE,
    text: REVEAL,
  },
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent" },
      targets: [],
      effect: COUNTER_UNLESS_ONE,
      resolve: null,
      text: TAX,
    },
  ],
});
