import { defineCard } from "../define.js";

export default defineCard({
  name: "Verdeloth the Ancient",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 4,
  toughness: 7,
  text: "Kicker {X} (You may pay an additional {X} as you cast this spell.)\nSaproling creatures and other Treefolk creatures get +1/+1.\nWhen Verdeloth enters, if it was kicked, create X 1/1 green Saproling creature tokens.",
  kicker: { cost: "{X}" },
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", anyOf: [{ subtype: "Saproling" }, { subtype: "Treefolk", isSource: false }] } },
      grantPt: [1, 1],
      text: "Saproling creatures and other Treefolk creatures get +1/+1.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Saproling Token", count: "x" },
      resolve: null,
      condition: { kind: "self-kicked" },
      text: "When Verdeloth enters, if it was kicked, create X 1/1 green Saproling creature tokens.",
    },
  ],
});
