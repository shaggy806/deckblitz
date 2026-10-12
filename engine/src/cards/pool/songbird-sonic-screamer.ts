import { defineCard } from "../define.js";

// EDHREC rank 17862. Marvel Super Heroes Commander.
//
// Putrid Imp's discard-for-flying.
const FLY_TEXT =
  "Discard a card: Songbird gains flying until end of turn. (She can't be blocked except by creatures with flying or reach.)";

export default defineCard({
  name: "Songbird, Sonic Screamer",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 2,
  toughness: 1,
  keywords: ["lifelink"],
  text: `Lifelink (Damage dealt by this creature also causes you to gain that much life.)\n${FLY_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: FLY_TEXT,
    },
  ],
});
