import { defineCard } from "../define.js";

// EDHREC rank 31664. Desperate Sentry's delirium static, with a keyword.
//
// Rulings:
//   Losing or gaining first strike after first-strike damage has been dealt won't cause Paranoid
//     Parish-Blade to deal combat damage twice or to not deal combat damage.

const DELIRIUM_TEXT =
  "Delirium — This creature gets +1/+0 and has first strike as long as there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Paranoid Parish-Blade",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  text: DELIRIUM_TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "delirium" },
      grantPt: [1, 0],
      grantKeywords: ["first-strike"],
      text: DELIRIUM_TEXT,
    },
  ],
});
