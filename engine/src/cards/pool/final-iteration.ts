import { defineCard } from "../define.js";

const TRIGGER_TEXT = "Whenever you cast an instant or sorcery spell, create a 1/1 blue Human Wizard creature token.";

export default defineCard({
  name: "Final Iteration",
  art: "https://cards.scryfall.io/art_crop/back/9/6/96658239-3169-42ef-9983-cd4da24e0f4c.jpg",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Insect"],
  power: 6,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\nWizards you control get +2/+1 and have flying.\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Wizard" },
      grantPt: [2, 1],
      grantKeywords: ["flying"],
      text: "Wizards you control get +2/+1 and have flying.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "create-token", token: "Human Wizard Token", count: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  faces: ["Docent of Perfection", "Final Iteration"],
  transform: true,
});
