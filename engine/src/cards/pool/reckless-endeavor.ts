import { defineCard } from "../define.js";

export default defineCard({
  name: "Reckless Endeavor",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Roll two d12 and choose one result. Reckless Endeavor deals damage equal to that result to each creature. Then create a number of Treasure tokens equal to the other result.",
  effect: {
    kind: "roll-dice",
    sides: 12,
    count: 2,
    then: {
      kind: "choose-value",
      value: "roll-result",
      then: {
        kind: "sequence",
        effects: [
          { kind: "damage-all", amount: "x", filter: { type: "creature" } },
          { kind: "create-token", token: "Treasure Token", count: { roll: "other" } },
        ],
      },
    },
  },
});
