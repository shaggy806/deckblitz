import { defineCard } from "../define.js";

// EDHREC rank 6546. Support X (rule 702.98): up to X target creatures, X as
// the artifact was cast. The granted trigger counts the kinds of counters on
// the creature it's on as it resolves.
const SUPPORT_TEXT = "When this artifact enters, support X. (Put a +1/+1 counter on each of up to X target creatures.)";
const GOAL_TEXT =
  'Go for the Goal! — {3}, {T}: Until end of turn, target creature gains "Whenever this creature deals combat damage to a player, draw a card for each kind of counter on it" and it can\'t be blocked this turn.';
const GRANTED = "Whenever this creature deals combat damage to a player, draw a card for each kind of counter on it.";

export default defineCard({
  name: "Blitzball Stadium",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["artifact"],
  text: `${SUPPORT_TEXT}\n${GOAL_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "creature", max: "x" }],
      effect: { kind: "for-each-target", from: 0, effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 } },
      resolve: null,
      text: SUPPORT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "grant-triggered",
            target: 0,
            duration: "end-of-turn",
            ability: {
              trigger: { on: "deals-combat-damage-to-player", who: "self" },
              targets: [],
              effect: {
                kind: "draw",
                amount: { aggregate: "distinct", of: "counter-kind", filter: { isSource: true } },
              },
              resolve: null,
              text: GRANTED,
            },
          },
          { kind: "restrict", target: 0, restrictions: ["cant-be-blocked"] },
        ],
      },
      resolve: null,
      text: GOAL_TEXT,
    },
  ],
});
