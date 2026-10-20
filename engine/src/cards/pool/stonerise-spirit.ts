import { defineCard } from "../define.js";

// EDHREC rank 27515.
const TEXT = "{4}, Exile a card from your graveyard: Target creature gains flying until end of turn.";

export default defineCard({
  name: "Stonerise Spirit",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Bird"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{4}", tap: false, exileFromGraveyard: { count: 1 } },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
