import { defineCard } from "../define.js";

export default defineCard({
  name: "Wakedancer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  text: "Morbid — When this creature enters, if a creature died this turn, create a 2/2 black Zombie creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: "Morbid — When this creature enters, if a creature died this turn, create a 2/2 black Zombie creature token.",
      condition: { kind: "creature-died-this-turn" },
    },
  ],
});
