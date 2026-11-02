import { defineCard } from "../define.js";

const TEXT = "When this creature dies, it deals 7 damage to a creature an opponent controls chosen at random.";

export default defineCard({
  name: "Cinderheart Giant",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Berserker"],
  power: 7,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        random: true,
        filter: { type: "creature", controlledBy: "opponent" },
        upTo: 1,
        prompt: "A creature an opponent controls, at random",
        then: { kind: "damage", amount: 7, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
