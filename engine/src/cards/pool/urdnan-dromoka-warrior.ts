import { defineCard } from "../define.js";

// EDHREC rank 7723.

// The counters are counted as the trigger resolves: two or more, double
// strike instead of first strike.
export default defineCard({
  name: "Urdnan, Dromoka Warrior",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 1,
  text: "When Urdnan enters, put a +1/+1 counter on target creature.\nWhenever you attack, target attacking creature with a +1/+1 counter on it gains first strike until end of turn. If that creature has two or more +1/+1 counters on it, it gains double strike until end of turn instead.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "When Urdnan enters, put a +1/+1 counter on target creature.",
    },
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", attacking: true, counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        },
      ],
      effect: {
        kind: "conditional",
        condition: {
          kind: "target",
          index: 0,
          filter: { counters: { kind: "+1/+1", compare: { op: "gte", n: 2 } } },
        },
        then: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
        else: { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      },
      resolve: null,
      text: "Whenever you attack, target attacking creature with a +1/+1 counter on it gains first strike until end of turn. If that creature has two or more +1/+1 counters on it, it gains double strike until end of turn instead.",
    },
  ],
});
