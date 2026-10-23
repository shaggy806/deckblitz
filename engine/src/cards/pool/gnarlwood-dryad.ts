import { defineCard } from "../define.js";

const DELIRIUM_TEXT =
  "Delirium — This creature gets +2/+2 as long as there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Gnarlwood Dryad",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad", "Horror"],
  power: 1,
  toughness: 1,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${DELIRIUM_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "delirium" },
      grantPt: [2, 2],
      text: DELIRIUM_TEXT,
    },
  ],
});
