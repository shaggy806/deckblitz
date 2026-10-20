import { defineCard } from "../define.js";
import { annihilator } from "../helpers.js";

// Rulings: "another Eldrazi you control dies" includes a noncreature Eldrazi
// permanent (a kindred one); with eight or more +1/+1 counters it's a 0/0
// creature (the counters make it 8/8 or bigger) with annihilator 2, and it
// stays a creature even if it loses its abilities — the type change is layer
// 4, before the loss in layer 6, and keeps applying (rule 613.6), which the
// layer fold does for a self-static's type grant (Goddric's ruling).

const SPAWN = '{1}{C}, {T}: Create a 0/1 colorless Eldrazi Spawn creature token with "Sacrifice this token: Add {C}."';
const GROW = "Whenever another Eldrazi you control dies, put a +1/+1 counter on this artifact.";
const AWAKEN =
  "As long as this artifact has eight or more +1/+1 counters on it, it's a 0/0 creature in addition to its other types and it has annihilator 2.";

export default defineCard({
  name: "Idol of False Gods",
  manaCost: "{2}",
  colors: [],
  types: ["kindred", "artifact"],
  subtypes: ["Eldrazi"],
  text: `${SPAWN}\n${GROW}\n${AWAKEN}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 8 } },
      addTypes: ["creature"],
      setBasePt: { power: 0, toughness: 0 },
      grantsTriggered: [annihilator(2)],
      text: AWAKEN,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", subtype: "Eldrazi" }, otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GROW,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{C}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Spawn Token", count: 1 },
      resolve: null,
      text: SPAWN,
    },
  ],
});
