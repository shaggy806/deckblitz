import { defineCard } from "../define.js";

// EDHREC rank 2457.
//
// Rulings:
//   [2025-06-13] Putting a land card onto the battlefield with PuPu UFO's first activated ability
//     doesn't count as playing a land.
//   [2025-06-13] Use the number of Towns you control when PuPu UFO's last ability resolves to
//     determine PuPu UFO's new base power.
//
// Base power alone (`become` with no `toughness`, rule 613.4b), fixed at the
// Towns counted as it resolves.
const LAND_TEXT = "{T}: You may put a land card from your hand onto the battlefield.";
const POWER_TEXT = "{3}: Until end of turn, this creature's base power becomes equal to the number of Towns you control.";

export default defineCard({
  name: "PuPu UFO",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct", "Alien"],
  power: 0,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${LAND_TEXT}\n${POWER_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "land" },
      },
      resolve: null,
      text: LAND_TEXT,
    },
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "become",
        target: "source",
        power: { countOf: { subtype: "Town", controlledBy: "you" } },
        duration: "end-of-turn",
      },
      resolve: null,
      text: POWER_TEXT,
    },
  ],
});
