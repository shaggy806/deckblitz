import { defineCard } from "../define.js";

// EDHREC rank 23404. Desperate Sentry's delirium static, granting a keyword.

const DELIRIUM_TEXT =
  "Delirium — This creature has double strike as long as there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Scourge Wolf",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wolf", "Horror"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${DELIRIUM_TEXT}`,
  static: [
    { affects: { scope: "self" }, condition: { kind: "delirium" }, grantKeywords: ["double-strike"], text: DELIRIUM_TEXT },
  ],
});
