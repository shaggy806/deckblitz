import { defineCard } from "../define.js";

const TEXT = "Whenever you cast a noncreature spell, this creature gets +1/+0 until end of turn, then scry 1.";

export default defineCard({
  name: "Burning Prophet",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
