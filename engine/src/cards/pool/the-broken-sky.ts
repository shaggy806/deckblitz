import { defineCard } from "../define.js";

const ANTHEM_TEXT = "Creature tokens you control get +1/+0 and have lifelink.";
const END_TEXT = "At the beginning of your end step, create a 1/1 white and black Spirit creature token with flying.";

export default defineCard({
  name: "The Broken Sky",
  art: "https://cards.scryfall.io/art_crop/back/0/0/00255899-aaaf-46c6-8037-bd0e3c06250c.jpg",
  colors: ["W", "B"],
  types: ["enchantment"],
  text: `${ANTHEM_TEXT}\n${END_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", tokenOnly: true },
      grantPt: [1, 0],
      grantKeywords: ["lifelink"],
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (White-Black)", count: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
  faces: ["Invasion of Tolvada", "The Broken Sky"],
  transform: true,
});
