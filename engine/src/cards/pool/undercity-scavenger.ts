import { defineCard } from "../define.js";

export default defineCard({
  name: "Undercity Scavenger",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, you may sacrifice another creature. If you do, put two +1/+1 counters on this creature, then scry 2.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
            { kind: "scry", amount: 2 },
          ],
        },
      },
      resolve: null,
      text: "When this creature enters, you may sacrifice another creature. If you do, put two +1/+1 counters on this creature, then scry 2.",
    },
  ],
});
