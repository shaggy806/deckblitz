import { defineCard } from "../define.js";

// EDHREC rank 20472. The Lost Caverns of Ixalan.
//
// Kamahl, Heart of Krosa's land animation (layer 4 types, layer 7b base
// P/T, keywords), then Magitek Scythe's "must be blocked if able" on the
// same target (rule 509.1c): at least one blocker, when one can.

export default defineCard({
  name: "Disturbed Slumber",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Until end of turn, target land you control becomes a 4/4 Dinosaur creature with reach and haste. It's still a land. It must be blocked this turn if able.",
  targets: ["land-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 4,
        addTypes: ["creature"],
        addSubtypes: ["Dinosaur"],
        keywords: ["reach", "haste"],
        duration: "end-of-turn",
      },
      { kind: "restrict", target: 0, restrictions: ["must-be-blocked-if-able"] },
    ],
  },
});
