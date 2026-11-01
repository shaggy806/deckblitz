import { defineCard } from "../define.js";
import { entersTappedStatic } from "../helpers.js";

const TRIGGER = "When this land enters, sacrifice it unless you tap an untapped permanent you control.";

export default defineCard({
  name: "Command Bridge",
  types: ["land"],
  text: `This land enters tapped.\n${TRIGGER}\n{T}: Add one mana of any color.`,
  static: [entersTappedStatic("This land")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ tapPermanent: { controlledBy: "you", tapped: false }, text: "Tap an untapped permanent you control" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
  ],
});
