import { defineCard } from "../define.js";
import { melee } from "../helpers.js";

// EDHREC rank 23451.
//
// Rulings:
//   [2016-08-23] Creatures that enter the battlefield attacking were never declared as attackers,
//     so they won’t count toward melee’s effect. Similarly, if a creature with melee enters the
//     battlefield attacking, melee won’t trigger.
//   [2016-08-23] You determine the size of the bonus as the melee ability resolves. Count each
//     opponent that you attacked with one or more creatures.
//
// Melee is a triggered ability (rule 702.121a), so "gains melee until end of
// turn" is a `grant-triggered` of the same `melee()` trigger — one more
// instance on a creature that already has it, each triggering on its own.
const MELEE_TEXT =
  "Melee (Whenever this creature attacks, it gets +1/+1 until end of turn for each opponent you attacked this combat.)";
const GRANT_TEXT =
  "At the beginning of combat on your turn, another target creature you control gains melee until end of turn.";

export default defineCard({
  name: "Fang of the Pack",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 5,
  toughness: 3,
  text: `${MELEE_TEXT}\n${GRANT_TEXT} (If a creature has multiple instances of melee, each triggers separately.)`,
  triggered: [
    melee(),
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-triggered", target: 0, duration: "end-of-turn", ability: melee() },
      resolve: null,
      text: GRANT_TEXT,
    },
  ],
});
