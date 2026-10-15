import { defineCard } from "../define.js";

// EDHREC rank 16587.
//
// "During turns other than yours" is a `not your-turn` static condition
// (Bello's shape for a type change by turn): it adds the creature type in
// layer 4 for as long as it isn't its controller's turn.

const STATIC_TEXT = "During turns other than yours, this Vehicle is an artifact creature.";

export default defineCard({
  name: "Midnight Mangler",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 3,
  text: `${STATIC_TEXT}\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "your-turn" } },
      addTypes: ["creature"],
      text: STATIC_TEXT,
    },
  ],
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
