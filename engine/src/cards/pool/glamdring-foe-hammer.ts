import { defineCard } from "../define.js";

// Glamdring's reduction reads the equipped creature's power as the cost is
// worked out (`powerOf: "attached"`), 0 while unattached; generic mana only
// (its rulings). Gleam of Death is the Adventure half.

const REDUCE_TEXT = "Instant and sorcery spells you cast cost {X} less to cast, where X is equipped creature's power.";

export default defineCard({
  name: "Glamdring, Foe-hammer",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${REDUCE_TEXT}\nEquip {2}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { typesAnyOf: ["instant", "sorcery"] },
        reduceGeneric: { powerOf: "attached" },
        when: { caster: "you" },
      },
      text: REDUCE_TEXT,
    },
  ],
  faces: ["Glamdring, Foe-hammer", "Gleam of Death"],
  adventure: true,
});
