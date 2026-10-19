import { defineCard } from "../define.js";
import { unearth } from "../helpers.js";

// EDHREC rank 7771.
const PROTOCOLS_TEXT = "Command Protocols — Other artifact creatures you control get +1/+0 and have menace.";

export default defineCard({
  name: "Skorpekh Lord",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Necron", "Noble"],
  power: 3,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${PROTOCOLS_TEXT}\nUnearth {2}{B} ({2}{B}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)`,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 0],
      grantKeywords: ["menace"],
      text: PROTOCOLS_TEXT,
    },
  ],
  activated: [unearth("{2}{B}")],
});
