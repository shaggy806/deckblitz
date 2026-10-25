import { defineCard } from "../define.js";

const TEXT =
  "As long as you control a Plains, this creature has first strike and lifelink. (Damage dealt by a creature with lifelink also causes its controller to gain that much life.)";

export default defineCard({
  name: "Sejiri Merfolk",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 2,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Plains" }, atLeast: 1 },
      grantKeywords: ["first-strike", "lifelink"],
      text: TEXT,
    },
  ],
});
