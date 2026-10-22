import { defineCard } from "../define.js";

// EDHREC rank 8702.
//
// Rulings: unlike Ixalan's other transforming cards it's exiled and returned
// transformed — a new object, untapped. It isn't exiled if it doesn't survive
// combat: the delayed ability's "it" is this object, which a Galleon that died
// (or left and came back) no longer is (rule 400.7).

const ATTACK_TEXT =
  "When this Vehicle attacks, exile it at end of combat, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "Conqueror's Galleon",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 2,
  toughness: 10,
  text: `${ATTACK_TEXT}\nCrew 4 (Tap any number of creatures you control with total power 4 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "end-of-combat",
        effect: { kind: "flicker", target: "source", transformed: true, underYourControl: true },
        text: "Exile Conqueror's Galleon, then return it to the battlefield transformed under your control.",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 4, filter: { type: "creature" } },
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
      text: "Crew 4",
    },
  ],
  faces: ["Conqueror's Galleon", "Conqueror's Foothold"],
  transform: true,
});
