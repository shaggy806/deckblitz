import { defineCard } from "../define.js";

const BITE = "{R}, {T}: This creature deals damage equal to its power to target creature. That creature deals damage equal to its power to this creature.";
const GROW = "Whenever a creature dealt damage by this creature this turn dies, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Vein Drinker",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${BITE}\n${GROW}`,
  activated: [
    {
      cost: { mana: "{R}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: { powerOf: "source" }, target: 0 },
          { kind: "fight", a: 0, b: "source", oneSided: true },
        ],
      },
      resolve: null,
      text: BITE,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", damagedThisTurnBy: { source: "this" } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GROW,
    },
  ],
});
