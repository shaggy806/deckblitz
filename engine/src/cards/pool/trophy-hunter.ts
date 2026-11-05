import { defineCard } from "../define.js";

const PING = "{1}{G}: This creature deals 1 damage to target creature with flying.";
const COUNTER = "Whenever a creature with flying dealt damage by this creature this turn dies, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Trophy Hunter",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 2,
  toughness: 3,
  text: `${PING}\n${COUNTER}`,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "any",
        filter: { type: "creature", keyword: "flying", damagedThisTurnBy: { source: "this" } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER,
    },
  ],
});
