import { defineCard } from "../define.js";

// Reality Fracture (FRA). EDHREC rank 18224.

const HASTE_TEXT = "Thopters you control have haste.";
const CAST_TEXT = "Whenever you cast a noncreature spell, create a 1/1 colorless Thopter artifact creature token with flying.";

export default defineCard({
  name: "Saheeli, Jewel of Avishkar",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 4,
  text: `${HASTE_TEXT}\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Thopter", controlledBy: "you" } },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "create-token", token: "Thopter Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
