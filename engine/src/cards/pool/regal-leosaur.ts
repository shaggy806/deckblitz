import { defineCard } from "../define.js";

export default defineCard({
  name: "Regal Leosaur",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Cat"],
  power: 2,
  toughness: 2,
  mutate: "{1}{R/W}{R/W}",
  text: "Mutate {1}{R/W}{R/W} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nWhenever this creature mutates, other creatures you control get +2/+1 until end of turn.",
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 1,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: "Whenever this creature mutates, other creatures you control get +2/+1 until end of turn.",
    },
  ],
});
