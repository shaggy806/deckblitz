import { defineCard } from "../define.js";

const HEROIC = "Heroic — Whenever you cast a spell that targets this creature, put a +1/+1 counter on it.";
const REMOVE = "Whenever a +1/+1 counter is put on this creature, remove a +1/+1 counter from target creature an opponent controls.";

export default defineCard({
  name: "Bloodcrazed Hoplite",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  text: `${HEROIC}\n${REMOVE}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: HEROIC,
    },
    {
      trigger: { on: "counters-put", who: "self", counter: "+1/+1", perCounter: true },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "remove-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: REMOVE,
    },
  ],
});
