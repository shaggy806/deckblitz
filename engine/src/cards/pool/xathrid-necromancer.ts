import { defineCard } from "../define.js";

// EDHREC rank 10367.
// Makes Zombie → use "Zombie Token".

export default defineCard({
  name: "Xathrid Necromancer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature or another Human creature you control dies, create a tapped 2/2 black Zombie creature token.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1, tapped: true },
      resolve: null,
      text: "Whenever this creature or another Human creature you control dies, create a tapped 2/2 black Zombie creature token.",
    },
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { subtype: "Human", type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1, tapped: true },
      resolve: null,
      text: "Whenever this creature or another Human creature you control dies, create a tapped 2/2 black Zombie creature token.",
    },
  ],
});
