import { defineCard } from "../define.js";

export default defineCard({
  name: "Valiant Endeavor",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Roll two d6 and choose one result. Destroy each creature with power greater than or equal to that result. Then create a number of 2/2 white Knight creature tokens with vigilance equal to the other result.",
  effect: {
    kind: "roll-dice",
    sides: 6,
    count: 2,
    then: {
      kind: "choose-value",
      value: "roll-result",
      then: {
        kind: "sequence",
        effects: [
          { kind: "destroy-all", filter: { type: "creature", power: { op: "gte", n: "x" } } },
          { kind: "create-token", token: "Knight Token", count: { roll: "other" } },
        ],
      },
    },
  },
});
