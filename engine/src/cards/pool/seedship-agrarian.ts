import { defineCard } from "../define.js";

// EDHREC rank 10738.

export default defineCard({
  name: "Seedship Agrarian",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Scientist"],
  power: 3,
  toughness: 3,
  text: "Whenever this creature becomes tapped, create a Lander token. (It's an artifact with \"{2}, {T}, Sacrifice this token: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.\")\nLandfall — Whenever a land you control enters, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Lander Token", count: 1 },
      resolve: null,
      text: "Whenever this creature becomes tapped, create a Lander token.",
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, put a +1/+1 counter on this creature.",
    },
  ],
});
