import { defineCard } from "../define.js";

const SPELLS_TEXT = "Players can't cast spells with the same name as a nontoken permanent.";
const LANDS_TEXT = "Players can't play nonbasic lands with the same name as a nontoken permanent.";

// Each card in hand is compared with every nontoken permanent's name as it
// is now (`sameNameWith: { permanents }`, rule 201.2a).
export default defineCard({
  name: "Cornered Market",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${SPELLS_TEXT}\n${LANDS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "cast", who: "each-player", filter: { sameNameWith: { permanents: { token: false } } } }],
      text: SPELLS_TEXT,
    },
    {
      affects: { scope: "self" },
      prohibits: [{ act: "play-land", who: "each-player", filter: { notSupertype: "basic", sameNameWith: { permanents: { token: false } } } }],
      text: LANDS_TEXT,
    },
  ],
});
