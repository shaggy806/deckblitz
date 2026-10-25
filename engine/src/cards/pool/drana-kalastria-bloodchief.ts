import { defineCard } from "../define.js";

const ABILITY = "{X}{B}{B}: Target creature gets -0/-X until end of turn and Drana gets +X/+0 until end of turn.";

export default defineCard({
  name: "Drana, Kalastria Bloodchief",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Shaman"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ABILITY}`,
  activated: [
    {
      cost: { mana: "{X}{B}{B}", tap: false },
      // An illegal target fizzles the whole ability, so Drana gets no bonus
      // then; she may target herself (the rulings).
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 0, toughness: { product: ["x", -1] }, duration: "end-of-turn" },
          { kind: "modify-pt", target: "source", power: "x", toughness: 0, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ABILITY,
    },
  ],
});
