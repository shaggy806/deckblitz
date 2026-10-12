import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";
import { REVOLT_CONDITION } from "../helpers.js";

// EDHREC rank 20483.
//
// Rulings:
//   [2026-01-27] Some disappear abilities, such as those of the above cards, are triggered
//     abilities with intervening if clauses. If a permanent hasn't left the battlefield under your
//     control that turn by the time the disappear ability would trigger, it won't trigger at all.
const SAC_TEXT =
  "Whenever this creature enters or attacks, you may sacrifice a token or a land. If you do, you gain 3 life.";
const DISAPPEAR_TEXT =
  "Disappear — At the beginning of your end step, if a permanent left the battlefield under your control this turn, draw a card.";

const sacrificeForLife = (trigger: TriggeredAbility["trigger"]): TriggeredAbility => ({
  trigger,
  targets: [],
  effect: {
    kind: "each-player-may",
    who: "you",
    options: [{ sacrifice: { anyOf: [{ token: true }, { type: "land" }] }, text: "Sacrifice a token or a land" }],
    ifDid: { kind: "gain-life", amount: 3 },
  },
  resolve: null,
  text: SAC_TEXT,
});

export default defineCard({
  name: "West Wind Avatar",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat", "Spirit", "Avatar"],
  power: 7,
  toughness: 7,
  keywords: ["trample"],
  text: `Trample\n${SAC_TEXT}\n${DISAPPEAR_TEXT}`,
  triggered: [
    sacrificeForLife({ on: "enters-battlefield", who: "self" }),
    sacrificeForLife({ on: "attacks", who: "self" }),
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      condition: REVOLT_CONDITION,
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DISAPPEAR_TEXT,
    },
  ],
});
