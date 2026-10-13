import { defineCard } from "../define.js";

// EDHREC rank 7067.
// The restricted mana pays for abilities of artifacts on the battlefield only
// (the ruling — `abilityOf` without `abilityOfAnyZone`), and never a triggered
// ability's cost. "Equipped" is having an Equipment attached (the ruling).
const MANA_TEXT = "{T}: Add {C}{C}. Spend this mana only to cast artifact spells or activate abilities of artifacts.";
const GRANT_TEXT = "Equipped creatures you control have flying and haste.";

export default defineCard({
  name: "Dalakos, Crafter of Wonders",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Merfolk", "Artificer"],
  power: 2,
  toughness: 4,
  text: `${MANA_TEXT}\n${GRANT_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 2,
        spendOnly: {
          spell: { type: "artifact" },
          abilityOf: { type: "artifact" },
          text: "Spend this mana only to cast artifact spells or activate abilities of artifacts.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", equipped: true } },
      grantKeywords: ["flying", "haste"],
      text: GRANT_TEXT,
    },
  ],
});
