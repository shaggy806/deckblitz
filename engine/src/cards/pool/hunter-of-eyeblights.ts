import { defineCard } from "../define.js";

// Lorwyn (LRW). EDHREC rank 21364. "A creature with a counter on it" is any
// kind of counter (the ruling): the filter's `counters` with no `kind`.
const ETB_TEXT = "When this creature enters, put a +1/+1 counter on target creature you don't control.";
const DESTROY_TEXT = "{2}{B}, {T}: Destroy target creature with a counter on it.";

export default defineCard({
  name: "Hunter of Eyeblights",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Assassin"],
  power: 3,
  toughness: 3,
  text: `${ETB_TEXT}\n${DESTROY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{B}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
});
