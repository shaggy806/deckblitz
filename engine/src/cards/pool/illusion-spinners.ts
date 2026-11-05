import { defineCard } from "../define.js";

// EDHREC rank 19931.
//
// The conditional flash is `flashIf` (rule 601.3d — Hungering Yeti); the
// hexproof is Dragonlord Ojutai's untapped condition.
const HEXPROOF_TEXT =
  "This creature has hexproof as long as it's untapped. (It can't be the target of spells or abilities your opponents control.)";

export default defineCard({
  name: "Illusion Spinners",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Wizard"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  flashIf: { condition: { kind: "controls", filter: { subtype: "Faerie" }, atLeast: 1 } },
  text: `You may cast this spell as though it had flash if you control a Faerie.\nFlying\n${HEXPROOF_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: false } },
      grantKeywords: ["hexproof"],
      text: HEXPROOF_TEXT,
    },
  ],
});
