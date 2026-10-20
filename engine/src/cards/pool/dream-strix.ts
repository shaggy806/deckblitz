import { defineCard } from "../define.js";
import { learn } from "../helpers.js";

// EDHREC rank 25160. Learn is the rummage alone: no deck here has a
// sideboard (AUTHORING.md, "learn").
const TARGET_TEXT = "When this creature becomes the target of a spell, sacrifice it.";
const DIES_TEXT =
  "When this creature dies, learn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)";

export default defineCard({
  name: "Dream Strix",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Illusion"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TARGET_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", spellOnly: true },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: TARGET_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: learn(),
      resolve: null,
      text: "When this creature dies, learn.",
    },
  ],
});
