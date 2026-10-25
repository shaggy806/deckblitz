import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const TEXT =
  "Whenever this creature or another Ally you control enters, target player mills X cards, where X is the number of Allies you control.";

export default defineCard({
  name: "Halimar Excavator",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Ally"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: { countOf: { subtype: "Ally", controlledBy: "you" } } },
      resolve: null,
      text: TEXT,
    }),
  ],
});
