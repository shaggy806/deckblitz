import { defineCard } from "../define.js";

export default defineCard({
  name: "Apothecary Stomper",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: "Vigilance (Attacking doesn't cause this creature to tap.)\nWhen this creature enters, choose one —\n• Put two +1/+1 counters on target creature you control.\n• You gain 4 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Put two +1/+1 counters on target creature you control.",
            targets: ["creature-you-control"],
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
          },
          { text: "You gain 4 life.", effect: { kind: "gain-life", amount: 4 } },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
