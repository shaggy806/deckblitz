import { defineCard } from "../define.js";

const CAST_TEXT =
  "Sarcophagus — You may cast this card from your graveyard by exiling another creature card from your graveyard in addition to paying its other costs.";

// Sarcophagus is an ability word (rule 207.2c). The exiled card is the
// caster's pick among the other creature cards there, as the cost is paid;
// the timing is a creature's as ever (its ruling).
export default defineCard({
  name: "Helbrute",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["artifact", "creature"],
  subtypes: ["Astartes", "Dreadnought"],
  power: 5,
  toughness: 4,
  keywords: ["haste"],
  text: `Haste\n${CAST_TEXT}`,
  mayPlaySelf: { from: ["graveyard"], exileOthers: 1, exileFilter: { type: "creature" } },
});
