import { defineCard } from "../define.js";

const GRANTED = "Whenever this creature deals combat damage to a creature, destroy that creature at end of combat.";
const GRANT_TEXT = `{1}{G}: Until end of turn, target creature with a +1/+1 counter on it gains "${GRANTED}"`;

export default defineCard({
  name: "Simic Basilisk",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Basilisk", "Mutant"],
  power: 0,
  toughness: 0,
  text: `Graft 3 (This creature enters with three +1/+1 counters on it. Whenever another creature enters, you may move a +1/+1 counter from this creature onto it.)\n${GRANT_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [
        { kind: "permanent", filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } } },
      ],
      effect: {
        kind: "grant-triggered",
        target: 0,
        duration: "end-of-turn",
        ability: {
          trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
          targets: [],
          effect: {
            kind: "delayed-trigger",
            at: { step: "end-combat" },
            effect: { kind: "destroy", target: "trigger-recipient" },
            text: "Destroy that creature.",
          },
          resolve: null,
          text: GRANTED,
        },
      },
      resolve: null,
      text: GRANT_TEXT,
    },
  ],
  // Graft 3 (rule 702.58a), as Plaxcaster Frogling's.
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Move a +1/+1 counter from Simic Basilisk onto the creature that entered?",
        effect: { kind: "move-counters", from: "source", to: "trigger-object", counter: "+1/+1" },
      },
      resolve: null,
      text: "Graft 3",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: "Graft 3",
    },
  ],
});
