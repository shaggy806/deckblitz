import { defineCard } from "../define.js";

export default defineCard({
  name: "Concerted Defense",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target noncreature spell unless its controller pays {1} plus an additional {1} for each creature in your party. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)",
  targets: ["noncreature-spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [
      {
        payGeneric: { sum: [1, { partySize: "you" }] },
        text: "Pay {1} plus {1} for each creature in Concerted Defense's controller's party.",
      },
    ],
    otherwise: { kind: "counter", target: 0 },
  },
});
