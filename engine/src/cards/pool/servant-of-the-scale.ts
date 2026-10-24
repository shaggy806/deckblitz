import { defineCard } from "../define.js";

// EDHREC rank 16885.
//
// X is the +1/+1 counters it had as it last existed on the battlefield.

const DIES_TEXT =
  "When this creature dies, put X +1/+1 counters on target creature you control, where X is the number of +1/+1 counters on this creature.";

export default defineCard({
  name: "Servant of the Scale",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 0,
  toughness: 0,
  text: `This creature enters with a +1/+1 counter on it.\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { countersOn: "source", counter: "+1/+1" } },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: "This creature enters with a +1/+1 counter on it.",
    },
  ],
});
