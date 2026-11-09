import { defineCard } from "../define.js";

export default defineCard({
  name: "Kangee, Aerie Keeper",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  kicker: { cost: "{X}{2}" },
  text: "Kicker {X}{2} (You may pay an additional {X}{2} as you cast this spell.)\nFlying\nWhen Kangee enters, if it was kicked, put X feather counters on it.\nOther Bird creatures get +1/+1 for each feather counter on Kangee.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "feather", amount: "x" },
      resolve: null,
      text: "When Kangee enters, if it was kicked, put X feather counters on it.",
      condition: { kind: "self-kicked" },
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Bird" }, excludeSelf: true },
      grantPtPerCount: { countersOnSource: "feather", pt: [1, 1] },
      text: "Other Bird creatures get +1/+1 for each feather counter on Kangee.",
    },
  ],
});
