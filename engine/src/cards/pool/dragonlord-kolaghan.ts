import { defineCard } from "../define.js";

const HASTE_TEXT = "Other creatures you control have haste.";
const LOSS_TEXT =
  "Whenever an opponent casts a creature or planeswalker spell with the same name as a card in their graveyard, that player loses 10 life.";

// "Their graveyard" is the caster's: the reference's `itsController`, read off
// the spell as it's cast (rule 201.2a).
export default defineCard({
  name: "Dragonlord Kolaghan",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Dragon"],
  power: 6,
  toughness: 5,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${HASTE_TEXT}\n${LOSS_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "opponent",
        filter: {
          typesAnyOf: ["creature", "planeswalker"],
          sameNameWith: { graveyard: {}, itsController: true },
        },
      },
      targets: [],
      effect: { kind: "lose-life", amount: 10, who: "trigger-controller" },
      resolve: null,
      text: LOSS_TEXT,
    },
  ],
});
