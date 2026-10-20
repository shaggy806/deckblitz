import { defineCard } from "../define.js";

const CLERIC = "Whenever another Cleric you control enters, you gain 1 life.";
const FIRST = "Whenever you gain life for the first time each turn, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Cleric of Life's Bond",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 2,
  toughness: 2,
  text: `${CLERIC}\n${FIRST}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Cleric" }, otherOnly: true },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: CLERIC,
    },
    {
      trigger: { on: "gains-life", who: "you", firstTimeEachTurn: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: FIRST,
    },
  ],
});
