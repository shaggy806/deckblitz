import { defineCard } from "../define.js";

// Pia Nalaar, Chief Mechanic's Nalaar Aetherjet token: printed */*, its base
// power and toughness set as it's made (`create-token`'s `basePt`).
export default defineCard({
  name: "Nalaar Aetherjet Token",
  tokenName: "Nalaar Aetherjet",
  art: "8f712a61-12c3-4d8e-93be-2b00dce4acbc",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: "Flying\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature until end of turn.)",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 2, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "add-types",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      crew: true,
      text: "Crew 2",
    },
  ],
});
