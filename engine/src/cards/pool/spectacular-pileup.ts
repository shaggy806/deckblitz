import { defineCard } from "../define.js";

// "Lose indestructible" reaches the creatures and Vehicles there as it
// resolves (rule 611.2c); then every creature and Vehicle is destroyed.

const CREATURES_AND_VEHICLES = { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } as const;

export default defineCard({
  name: "Spectacular Pileup",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "All creatures and Vehicles lose indestructible until end of turn, then destroy all creatures and Vehicles.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  cycling: { cost: "{2}" },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-keywords", filter: CREATURES_AND_VEHICLES, keywords: ["indestructible"], duration: "end-of-turn" },
      { kind: "destroy-all", filter: CREATURES_AND_VEHICLES },
    ],
  },
});
