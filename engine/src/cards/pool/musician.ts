import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 23223. The granted upkeep trigger is the creature's own, for
// good (no duration, the ruling), and only once (`unlessHas`): more Musicians
// add music counters, not triggers. A music counter put some other way does
// nothing on a creature that never gained it.
//
// Rulings:
//   Although a creature can gain the triggered ability only once, it can be targeted by
//   multiple Musicians to increase its number of music counters.
//   This ability has no duration. An affected creature will retain the triggered ability
//   until the game ends, it leaves the battlefield, or some other effect causes it to lose
//   its abilities. It doesn't matter if Musician is still on the battlefield or not.

const UPKEEP_TEXT =
  "Cumulative upkeep {1} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";
const GRANTED = "At the beginning of your upkeep, destroy this creature unless you pay {1} for each music counter on it.";
const TAP_TEXT = `{T}: Put a music counter on target creature. If it doesn't have "${GRANTED.slice(0, -1)}," it gains that ability.`;

const MUSIC: TriggeredAbility = {
  trigger: { on: "step-begins", step: "upkeep", who: "you" },
  targets: [],
  effect: {
    kind: "unless",
    chooser: "you",
    options: [{ pay: "{1}", times: { countersOn: "source", counter: "music" }, text: "Pay {1} for each music counter" }],
    otherwise: { kind: "destroy", target: "source" },
  },
  resolve: null,
  text: GRANTED,
};

export default defineCard({
  name: "Musician",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: `${UPKEEP_TEXT}\n${TAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "age", amount: 1 },
            {
              kind: "unless",
              chooser: "you",
              options: [{ pay: "{1}", times: { countersOn: "source", counter: "age" }, text: "Pay {1} for each age counter" }],
              otherwise: { kind: "sequence", effects: [{ kind: "cumulative-upkeep-unpaid" }, { kind: "sacrifice-source" }] },
            },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "music", amount: 1 },
          { kind: "grant-triggered", target: 0, ability: MUSIC, duration: "permanent", unlessHas: true },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
