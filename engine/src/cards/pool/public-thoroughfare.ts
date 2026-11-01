import { defineCard } from "../define.js";

// Its ruling: an untapped Public Thoroughfare can be tapped for its own
// trigger — it's one of the untapped lands you control.

const ENTERS = "When this land enters, sacrifice it unless you tap an untapped artifact or land you control.";
const UNTAPPED = { typesAnyOf: ["artifact", "land"], controlledBy: "you", tapped: false } as const;

export default defineCard({
  name: "Public Thoroughfare",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n${ENTERS}\n{T}: Add one mana of any color.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ tapPermanent: UNTAPPED, text: "Tap an untapped artifact or land you control" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
