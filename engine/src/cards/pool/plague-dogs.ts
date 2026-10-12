import { defineCard } from "../define.js";

export default defineCard({
  name: "Plague Dogs",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie", "Dog"],
  power: 3,
  toughness: 3,
  text: "When this creature dies, all creatures get -1/-1 until end of turn.\n{2}, Sacrifice this creature: Draw a card.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{2}, Sacrifice this creature: Draw a card.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "When this creature dies, all creatures get -1/-1 until end of turn.",
    },
  ],
});
