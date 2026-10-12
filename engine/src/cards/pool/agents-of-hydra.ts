import { defineCard } from "../define.js";

export default defineCard({
  name: "Agents of HYDRA",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Spy", "Villain"],
  power: 1,
  toughness: 1,
  text: "When this creature dies, create a 2/1 black Villain creature token with menace. (It can't be blocked except by two or more creatures.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Villain Token", count: 1 },
      resolve: null,
      text: "When this creature dies, create a 2/1 black Villain creature token with menace.",
    },
  ],
});
