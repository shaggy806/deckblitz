import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, if you cast it from your hand and there are five or more other creatures on the battlefield, destroy all other creatures.";

export default defineCard({
  name: "Deathbringer Regent",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: {
        kind: "all",
        of: [
          { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
          { kind: "controls", filter: { type: "creature" }, atLeast: 5, anyController: true, excludeSelf: true },
        ],
      },
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "creature" }, exceptSource: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
