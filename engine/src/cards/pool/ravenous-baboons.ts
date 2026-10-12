import { defineCard } from "../define.js";

export default defineCard({
  name: "Ravenous Baboons",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Monkey"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, destroy target nonbasic land.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { notSupertype: "basic", type: "land" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters, destroy target nonbasic land.",
    },
  ],
});
