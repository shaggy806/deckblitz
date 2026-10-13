import { defineCard } from "../define.js";

// EDHREC rank 7035.
//
// Rulings:
//   [2023-02-04] If Graaz loses its abilities for some reason, then Juggernauts you control will
//     not have to attack each combat and will be able to be blocked by Walls. However, due to how
//     continuous effects are applied in layers, other creatures you control will continue to be
//     5/3 Juggernauts in addition to their other types. Unstoppable, indeed!

const ATTACKS = "Juggernauts you control attack each combat if able.";
const WALLS = "Juggernauts you control can't be blocked by Walls.";
const OTHERS =
  "Other creatures you control have base power and toughness 5/3 and are Juggernauts in addition to their other creature types.";

const JUGGERNAUTS = { type: "creature", subtype: "Juggernaut", controlledBy: "you" } as const;

export default defineCard({
  name: "Graaz, Unstoppable Juggernaut",
  manaCost: "{8}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Juggernaut"],
  power: 7,
  toughness: 5,
  text: `${ATTACKS}\n${WALLS}\n${OTHERS}`,
  static: [
    // Graaz and every creature its last ability makes a Juggernaut.
    { affects: { scope: "filter", filter: JUGGERNAUTS }, restrictions: ["must-attack"], text: ATTACKS },
    { affects: { scope: "filter", filter: JUGGERNAUTS }, cantBeBlockedBy: { subtype: "Wall" }, text: WALLS },
    // Kudo, King Among Bears' shape: layer 4 and layer 7b.
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" }, excludeSelf: true },
      addSubtypes: ["Juggernaut"],
      setBasePt: { power: 5, toughness: 3 },
      text: OTHERS,
    },
  ],
});
