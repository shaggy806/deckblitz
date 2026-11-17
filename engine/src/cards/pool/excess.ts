import { defineCard } from "../define.js";

// The aftermath half of Indulge // Excess: cast only from a graveyard, then
// exiled (rule 702.127a). Each creature is counted once however often it
// dealt combat damage (double strike), as it was then and whoever controls it
// now (the ruling) — the journal's `dealt-combat-damage-to-player`.
const FACES = ["Indulge // Excess", "Indulge", "Excess"];

export default defineCard({
  name: "Excess",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "Aftermath (Cast this spell only from your graveyard. Then exile it.)\n" +
    "Create a Treasure token for each creature you controlled that dealt combat damage to a player this turn.",
  targets: [],
  effect: {
    kind: "create-token",
    token: "Treasure Token",
    count: { turnHistory: "dealt-combat-damage-to-player", who: "you", filter: { type: "creature" } },
  },
  faces: FACES,
  split: true,
  aftermath: true,
});
