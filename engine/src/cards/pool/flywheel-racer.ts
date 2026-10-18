import { defineCard } from "../define.js";

// EDHREC rank 9793.
//
// "Activate only if this permanent is a creature" is a source condition
// (Mirrex's shape), which also keeps the auto-payer off it while it isn't
// crewed.

const MANA_TEXT = "{T}: Add one mana of any color. Activate only if this permanent is a creature.";

export default defineCard({
  name: "Flywheel Racer",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${MANA_TEXT}\nCrew 1 (Tap any number of creatures you control with total power 1 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      condition: { kind: "source", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 1, filter: { type: "creature" } },
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
      text: "Crew 1",
    },
  ],
});
