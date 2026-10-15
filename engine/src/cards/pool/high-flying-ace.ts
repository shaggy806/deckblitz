import { defineCard } from "../define.js";

// EDHREC rank 25466.

const GRANT_TEXT =
  "{3}{W}: Target creature without flying gains flying until end of turn. Activate only as a sorcery.";

export default defineCard({
  name: "High-Flying Ace",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Mutant"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${GRANT_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      sorcerySpeed: true,
      targets: [{ kind: "permanent", filter: { type: "creature", notKeyword: "flying" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: GRANT_TEXT,
    },
  ],
});
