import { defineCard } from "../define.js";

const DELIRIUM_TEXT =
  "Delirium — This creature gets +1/+1 and has menace as long as there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Thraben Foulbloods",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Dog"],
  power: 3,
  toughness: 2,
  text: `${DELIRIUM_TEXT} (A creature with menace can't be blocked except by two or more creatures.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "delirium" },
      grantPt: [1, 1],
      grantKeywords: ["menace"],
      text: DELIRIUM_TEXT,
    },
  ],
});
