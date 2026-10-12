import { defineCard } from "../define.js";

export default defineCard({
  name: "Dwarven Forge-Chanter",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Wizard"],
  power: 1,
  toughness: 3,
  text: "Ward—Pay 2 life. (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays 2 life.)\nProwess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { payLife: 2 } },
      resolve: null,
      text: "Ward—Pay 2 life.",
    },
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
    },
  ],
});
