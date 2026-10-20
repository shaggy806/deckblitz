import { defineCard } from "../define.js";

// EDHREC rank 28592. Zendikar Rising.
//
// "This creature and at least one other Warrior attack" is part of the
// trigger condition (`whileCondition`, Falcon, Joaquin Torres's battalion
// shape): another attacking Warrior, whichever player or planeswalker it
// attacks (the ruling); one counter however many (the ruling).

const TEXT = "Whenever this creature and at least one other Warrior attack, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Paired Tactician",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: {
        kind: "controls",
        filter: { type: "creature", subtype: "Warrior", attacking: true },
        atLeast: 1,
        excludeSelf: true,
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
