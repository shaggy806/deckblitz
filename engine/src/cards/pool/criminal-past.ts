import { defineCard } from "../define.js";

// The commander has the quoted static (`grantsStatic`), working from it: "your
// graveyard" is its controller's (rule 113.10).

const TEXT =
  "Commander creatures you own have menace and \"This creature gets +X/+0, where X is the number of creature cards in your graveyard.\"";

export default defineCard({
  name: "Criminal Past",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Background"],
  text: `${TEXT} (A creature with menace can't be blocked except by two or more creatures.)`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      grantKeywords: ["menace"],
      grantsStatic: [
        {
          affects: { scope: "self" },
          grantPtPerCount: { inGraveyard: { type: "creature", ownedBy: "you" }, pt: [1, 0] },
          text: "This creature gets +X/+0, where X is the number of creature cards in your graveyard.",
        },
      ],
      text: TEXT,
    },
  ],
});
