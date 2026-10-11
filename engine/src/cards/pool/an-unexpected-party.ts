import { defineCard } from "../define.js";

// An adventurer card (rule 715): its Adventure is At the Door. The type is
// chosen as it enters (rule 614.12 — Obelisk of Urd's shape), so there is
// no moment without it.
const CHOOSE_TEXT = "As this enchantment enters, choose a creature type.";
const ANTHEM_TEXT = "Creatures you control of the chosen type get +2/+2.";

export default defineCard({
  name: "An Unexpected Party",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${CHOOSE_TEXT}\n${ANTHEM_TEXT}`,
  faces: ["An Unexpected Party", "At the Door"],
  adventure: true,
  chooseCreatureTypeOnEnter: true,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", ofChosenType: true } },
      grantPt: [2, 2],
      text: ANTHEM_TEXT,
    },
  ],
});
