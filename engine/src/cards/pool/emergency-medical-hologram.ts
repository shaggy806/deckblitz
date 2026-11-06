import { defineCard } from "../define.js";


export default defineCard({
  name: "Emergency Medical Hologram",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Illusion", "Doctor"],
  power: 0,
  toughness: 1,
  text: "When this creature enters, put a +1/+1 counter on target creature. You gain 1 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "When this creature enters, put a +1/+1 counter on target creature. You gain 1 life.",
    },
  ],
});
