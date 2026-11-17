import { defineCard } from "../define.js";

// EDHREC rank 11424. Commander Legends: Streets of New Capenna. The whole
// card: every zone but the stack (rule 709.4) — both names, the combined
// mana cost, its colour and type. Never cast itself; a spell is one half or
// the other (indulge.ts, and excess.ts with aftermath, rule 702.127a).
const FACES = ["Indulge // Excess", "Indulge", "Excess"];

export default defineCard({
  name: "Indulge // Excess",
  manaCost: "{2}{R}{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "Whenever a creature you control attacks this turn, create a 1/1 green and white Citizen creature token that's tapped and attacking.\n" +
    "//\n" +
    "Aftermath (Cast this spell only from your graveyard. Then exile it.)\n" +
    "Create a Treasure token for each creature you controlled that dealt combat damage to a player this turn.",
  faces: FACES,
  split: true,
});
