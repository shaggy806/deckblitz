import { defineCard } from "../define.js";

// EDHREC rank 26667.

const LIFE_TEXT = "When this creature enters, you gain 3 life.";
const TRANSFORM_TEXT = "{6}{B/P}: Transform this creature. Activate only as a sorcery.";

export default defineCard({
  name: "Herbology Instructor",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Druid"],
  power: 1,
  toughness: 3,
  text: `${LIFE_TEXT}\n${TRANSFORM_TEXT} ({B/P} can be paid with either {B} or 2 life.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{6}{B/P}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
      sorcerySpeed: true,
    },
  ],
  faces: ["Herbology Instructor", "Malady Invoker"],
  transform: true,
});
