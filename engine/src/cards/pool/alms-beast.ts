import { defineCard } from "../define.js";

export default defineCard({
  name: "Alms Beast",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 6,
  text: "Creatures blocking or blocked by this creature have lifelink.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", blockingRelation: { relation: "either" } } },
      grantKeywords: ["lifelink"],
      text: "Creatures blocking or blocked by this creature have lifelink.",
    },
  ],
});
