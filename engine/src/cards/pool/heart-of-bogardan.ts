import { defineCard } from "../define.js";

// EDHREC rank 30307.
//
// Rulings:
//   [2008-04-01] In other words, if you sacrifice Heart of Bogardan rather than pay its cumulative
//     upkeep, X is equal to the amount of mana last spent to pay its cumulative upkeep.
//
// Cumulative upkeep {2} is written out (the `cumulativeUpkeep` helper's
// shape) so its "if you don't" can carry the second ability: "when a player
// doesn't pay this enchantment's cumulative upkeep" is an event that happens
// while the upkeep ability resolves, so the ability triggers then and goes on
// the stack once it has finished (rule 603.2) — a `reflexive-trigger` placed
// at the moment of not paying, ahead of the sacrifice. It chooses its target
// as it's put on the stack (rule 603.3d). X is read as it triggers, the age
// counters still on the enchantment (`value`): twice them minus 2, never
// below 0 (rule 107.1b) — the mana last paid, as the ruling says. The damage
// is the enchantment's, as it last existed once it's been sacrificed, dealt
// to the player or planeswalker and each creature of that player (or that
// planeswalker's controller) at once — Bonfire of the Damned's shape.

const UPKEEP_TEXT =
  "Cumulative upkeep {2} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";
const UNPAID_TEXT =
  "When a player doesn't pay this enchantment's cumulative upkeep, this enchantment deals X damage to target player or planeswalker and each creature that player or that planeswalker's controller controls, where X is twice the number of age counters on this enchantment minus 2.";

const ages = { countersOn: "source", counter: "age" } as const;

export default defineCard({
  name: "Heart of Bogardan",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${UNPAID_TEXT}`,
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
              options: [{ pay: "{2}", times: ages, text: "Pay {2} for each age counter" }],
              otherwise: {
                kind: "sequence",
                effects: [
                  {
                    kind: "reflexive-trigger",
                    targets: ["player-or-planeswalker"],
                    value: { difference: [{ product: [2, ages] }, 2] },
                    effect: {
                      kind: "sequence",
                      simultaneous: true,
                      effects: [
                        { kind: "damage", amount: { triggerValue: true }, target: 0 },
                        {
                          kind: "damage-all",
                          filter: { type: "creature" },
                          amount: { triggerValue: true },
                          controlledByTarget: 0,
                        },
                      ],
                    },
                    text: UNPAID_TEXT,
                  },
                  { kind: "sacrifice-source" },
                ],
              },
            },
          ],
        },
      },
      resolve: null,
      text: `${UPKEEP_TEXT}\n${UNPAID_TEXT}`,
    },
  ],
});
