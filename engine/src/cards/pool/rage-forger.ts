import { defineCard } from "../define.js";

// EDHREC rank 25310.

const ENTERS = "When this creature enters, put a +1/+1 counter on each other Shaman creature you control.";
const ATTACKS =
  "Whenever a creature you control with a +1/+1 counter on it attacks, you may have that creature deal 1 damage to target player or planeswalker.";

export default defineCard({
  name: "Rage Forger",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 2,
  toughness: 2,
  text: `${ENTERS}\n${ATTACKS}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", subtype: "Shaman", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
        exceptSource: true,
      },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: {
        on: "attacks",
        who: "you-control",
        filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "may",
        prompt: "Have that creature deal 1 damage to the target?",
        // The attacking creature is the source of the damage.
        effect: { kind: "damage", amount: 1, target: 0, from: "trigger-object" },
      },
      resolve: null,
      text: ATTACKS,
    },
  ],
});
