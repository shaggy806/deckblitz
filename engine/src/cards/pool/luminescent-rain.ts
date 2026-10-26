import { defineCard } from "../define.js";

// Rulings:
//   [2008-04-01] Note that this spell counts the number of permanents you control of the chosen
//     type, not just the number of creatures you control. It will also take your kindred
//     permanents of the chosen type into account.

export default defineCard({
  name: "Luminescent Rain",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose a creature type. You gain 2 life for each permanent you control of that type.",
  // Every permanent of the type, kindred ones included (its ruling).
  targets: [],
  effect: {
    kind: "choose-creature-type",
    then: {
      kind: "gain-life",
      amount: { countOf: { controlledBy: "you", subtype: "$chosen" }, times: 2 },
    },
  },
});
