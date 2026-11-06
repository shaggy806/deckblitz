import { defineCard } from "../define.js";

// Mystery Booster Commander. "For every seven" is the count divided by seven,
// rounded down (`step`).
const FOOD =
  "Whenever another creature dies, create a Food token. This ability triggers only once each turn. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")";
const LORD = "For every seven Foods you control, Squirrels you control get +3/+3.";

export default defineCard({
  name: "Meatsqueak, Hoard Lord",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Squirrel"],
  power: 2,
  toughness: 3,
  text: `${FOOD}\n${LORD}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      oncePerTurn: true,
      resolve: null,
      text: FOOD,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Squirrel" },
      grantPtPerCount: { filter: { subtype: "Food", controlledBy: "you" }, step: 7, pt: [3, 3] },
      text: LORD,
    },
  ],
});
