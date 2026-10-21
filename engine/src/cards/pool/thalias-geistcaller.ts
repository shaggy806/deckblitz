import { defineCard } from "../define.js";

// EDHREC rank 21806. Any Spirit pays the sacrifice, not only its own tokens
// (the ruling).

const CAST_TEXT = "Whenever you cast a spell from your graveyard, create a 1/1 white Spirit creature token with flying.";
const SAC_TEXT = "Sacrifice a Spirit: This creature gains indestructible until end of turn.";

export default defineCard({
  name: "Thalia's Geistcaller",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 1,
  keywords: ["lifelink"],
  text: `Lifelink\n${CAST_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", from: "graveyard" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Spirit" } } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
