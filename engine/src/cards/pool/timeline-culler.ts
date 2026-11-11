import { defineCard } from "../define.js";

// Warp with life in its cost, and from the graveyard too: `warp`'s `payLife`
// and `fromGraveyard` (rule 702.185a).
export default defineCard({
  name: "Timeline Culler",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Drix", "Warlock"],
  power: 2,
  toughness: 2,
  text:
    "Haste\n" +
    "You may cast this card from your graveyard using its warp ability.\n" +
    "Warp—{B}, Pay 2 life. (You may cast this card from your hand or graveyard for its warp cost. " +
    "If you do, exile this creature at the beginning of the next end step, then you may cast it " +
    "from exile on a later turn.)",
  keywords: ["haste"],
  warp: { cost: "{B}", payLife: 2, fromGraveyard: true },
});
