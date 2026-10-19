import { defineCard } from "../define.js";

// EDHREC rank 20603.

export default defineCard({
  name: "Flaming Fist Officer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Gnome", "Soldier"],
  power: 2,
  toughness: 2,
  text: "Whenever another creature you control leaves the battlefield, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: {
        on: "leaves-battlefield",
        who: "you-control",
        filter: { type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever another creature you control leaves the battlefield, put a +1/+1 counter on this creature.",
    },
  ],
});
