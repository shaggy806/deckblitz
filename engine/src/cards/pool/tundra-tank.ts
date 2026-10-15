import { defineCard } from "../define.js";
import { firebending } from "../helpers.js";

// EDHREC rank 18441.
//
// Rulings:
//   [2025-10-02] Firebending abilities aren't mana abilities. They use the stack and can be
//     responded to.
//   [2025-10-02] Mana from firebending abilities isn't lost until you leave combat and go to your
//     second main phase.
//
// Firebending is an attack trigger, so it fires only while the Vehicle is a
// crewed creature attacking.

const FIREBENDING_TEXT = "Firebending 1 (Whenever this creature attacks, add {R}. This mana lasts until end of combat.)";
const ETB_TEXT = "When this Vehicle enters, target creature you control gains indestructible until end of turn.";

export default defineCard({
  name: "Tundra Tank",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  text: `${FIREBENDING_TEXT}\n${ETB_TEXT}\nCrew 1 (Tap any number of creatures you control with total power 1 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  activated: [
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
  triggered: [
    firebending(1, FIREBENDING_TEXT),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
