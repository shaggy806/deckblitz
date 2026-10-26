import { defineCard } from "../define.js";

export default defineCard({
  name: "Dwarven Berserker",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Berserker"],
  power: 1,
  toughness: 1,
  text: "Whenever this creature becomes blocked, it gets +3/+0 and gains trample until end of turn.",
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 3, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Whenever this creature becomes blocked, it gets +3/+0 and gains trample until end of turn.",
    },
  ],
});
