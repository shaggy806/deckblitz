import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 32490.
//
// Its second line works only while it's in a graveyard (rule 113.6b): a resolving Flame Burst's
// count of "cards named Flame Burst in all graveyards" counts it (`countsAsNamedFor`).

const NAMED_TEXT =
  "If this card is in a graveyard, effects from spells named Flame Burst count it as a card named Flame Burst.";

export default defineCard({
  name: "Pardic Firecat",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Cat"],
  power: 2,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${NAMED_TEXT}`,
  static: [{ affects: { scope: "self" }, fromGraveyard: true, countsAsNamedFor: "Flame Burst", text: NAMED_TEXT }],
});
