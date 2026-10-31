import { defineCard } from "../define.js";

// The commander has the quoted static (`grantsStatic`), working from it: "you"
// is the commander's controller (rule 113.10), so a commander you own that an
// opponent controls pumps their tokens.

const TEXT = "Commander creatures you own have \"Creature tokens you control get +2/+2.\"";

export default defineCard({
  name: "Inspiring Leader",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Background"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      grantsStatic: [
        {
          affects: { scope: "creatures-you-control", tokenOnly: true },
          grantPt: [2, 2],
          text: "Creature tokens you control get +2/+2.",
        },
      ],
      text: TEXT,
    },
  ],
});
