import { defineCard } from "../define.js";
import { STORIED_TEXT } from "../helpers.js";

const STORY_TEXT = "As long as you have an enduring story, Óin gets +1/+0 and has haste.";
const LOOT_TEXT = "{1}, {T}, Discard a card: Draw a card.";

export default defineCard({
  name: "Óin the Brave",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Warrior"],
  power: 1,
  toughness: 3,
  keywords: ["storied"],
  text: `${STORIED_TEXT}\n${STORY_TEXT}\n${LOOT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "enduring-story" },
      grantPt: [1, 0],
      grantKeywords: ["haste"],
      text: STORY_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
});
