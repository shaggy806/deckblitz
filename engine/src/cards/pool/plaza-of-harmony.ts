import { defineCard } from "../define.js";

// EDHREC rank 7644.
//
// "Any type" a Gate you control could produce (rule 106.7) — colorless
// included (the ruling) — read off the Gates' mana abilities, their costs
// ignored, so a tapped Gate counts (the ruling). The gain is an
// intervening-if (rule 603.4): checked as it triggers and as it resolves.
const ENTER_TEXT = "When this land enters, if you control two or more Gates, you gain 3 life.";
const TYPE_TEXT = "{T}: Add one mana of any type that a Gate you control could produce.";

export default defineCard({
  name: "Plaza of Harmony",
  colors: [],
  types: ["land"],
  text: `${ENTER_TEXT}\n{T}: Add {C}.\n${TYPE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { producedBy: "your-lands", filter: { subtype: "Gate" }, anyType: true }, amount: 1 },
      resolve: null,
      text: TYPE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Gate" }, atLeast: 2 },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
