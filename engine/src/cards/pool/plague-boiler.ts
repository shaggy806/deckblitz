import { defineCard } from "../define.js";

// EDHREC rank 22693. Ravnica: City of Guilds.
//
// Rulings:
//   [2005-10-01] You choose whether to add or remove a counter when the second ability resolves.
//     You can’t choose to remove a counter if there isn’t one there.
//   [2005-10-01] If the third ability triggers, removing a counter in response won’t stop the
//     effect. However, somehow removing Plague Boiler from the battlefield in response would stop
//     the effect because then you wouldn’t be able to sacrifice Plague Boiler.
//   [2005-10-01] The sacrifice is done on resolution of the triggered ability.
//
// The {1}{B}{G} choice is an unannounced modal (made as it resolves, Jinxed
// Choker's shape), offered only while there's a plague counter to remove;
// with none, the counter goes on. The state trigger has no intervening-if, so
// removing a counter in response doesn't stop it; `sacrifice-source`'s `then`
// is "if you do".

const UPKEEP_TEXT = "At the beginning of your upkeep, put a plague counter on this artifact.";
const ACTIVATED_TEXT = "{1}{B}{G}: Put a plague counter on this artifact or remove a plague counter from it.";
const STATE_TEXT =
  "When this artifact has three or more plague counters on it, sacrifice it. If you do, destroy all nonland permanents.";

export default defineCard({
  name: "Plague Boiler",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${UPKEEP_TEXT}\n${ACTIVATED_TEXT}\n${STATE_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}{G}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "plague", compare: { op: "gte", n: 1 } },
        then: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            {
              text: "Put a plague counter on this artifact.",
              effect: { kind: "add-counter", target: "source", counter: "plague", amount: 1 },
            },
            {
              text: "Remove a plague counter from this artifact.",
              effect: { kind: "remove-counter", target: "source", counter: "plague", amount: 1 },
            },
          ],
        },
        else: { kind: "add-counter", target: "source", counter: "plague", amount: 1 },
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "plague", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: {
        on: "state",
        state: { kind: "self-counters", counter: "plague", compare: { op: "gte", n: 3 } },
      },
      targets: [],
      effect: {
        kind: "sacrifice-source",
        then: { kind: "destroy-all", filter: { notTypes: ["land"] } },
      },
      resolve: null,
      text: STATE_TEXT,
    },
  ],
});
