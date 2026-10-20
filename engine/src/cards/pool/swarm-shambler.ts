import { defineCard } from "../define.js";

// EDHREC rank 15325. Zendikar Rising.
//
// The targeted trigger reads the creature as it becomes the target: one with a
// +1/+1 counter on it then, targeted by an opponent's spell (Thorn
// Lieutenant's `byOpponentOnly`, Dream Strix's `spellOnly`). A counter put on
// it afterwards doesn't make it trigger (the ruling).

const ENTER_TEXT = "This creature enters with a +1/+1 counter on it.";
const TARGET_TEXT =
  "Whenever a creature you control with a +1/+1 counter on it becomes the target of a spell an opponent controls, create a 1/1 green Insect creature token.";
const PUMP_TEXT = "{1}, {T}: Put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Swarm Shambler",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus", "Beast"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${TARGET_TEXT}\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "becomes-target",
        who: "you-control",
        filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        spellOnly: true,
        byOpponentOnly: true,
      },
      targets: [],
      effect: { kind: "create-token", token: "Insect Token", count: 1 },
      resolve: null,
      text: TARGET_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
