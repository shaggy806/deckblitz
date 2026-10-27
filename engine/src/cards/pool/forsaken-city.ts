import { defineCard } from "../define.js";

// The exile may be done while the land is already untapped (the ruling).
const NO_UNTAP = "This land doesn't untap during your untap step.";
const UPKEEP = "At the beginning of your upkeep, you may exile a card from your hand. If you do, untap this land.";
const MANA = "{T}: Add one mana of any color.";

export default defineCard({
  name: "Forsaken City",
  colors: [],
  types: ["land"],
  text: `${NO_UNTAP}\n${UPKEEP}\n${MANA}`,
  static: [{ affects: { scope: "self" }, doesntUntap: true, text: NO_UNTAP }],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "look-and-choose", zone: "hand", min: 0, max: 1, destination: "exile", leftover: "stay" },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", atLeast: 1 },
            then: { kind: "untap", target: "source" },
          },
        ],
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
