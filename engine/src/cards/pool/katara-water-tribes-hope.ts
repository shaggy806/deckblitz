import { defineCard } from "../define.js";

// EDHREC rank 4549.
//
// Rulings:
//   [2025-10-02] Katara, Water Tribe's Hope's ability overwrites any effects that previously set
//     a creature's base power and/or toughness. Any existing effects or counters that raise or
//     lower a creature's power and/or toughness continue to apply.
//
// Biomass Mutation's `animate-all` (layer 7b) with the ability's own X — "X
// can't be 0" is `minX: 1`. "Waterbend {X}": X of its generic may be paid by
// tapping artifacts and creatures, so the creatures it makes X/X may be the
// ones that paid for it.

const ENTER_TEXT = "When Katara enters, create a 1/1 white Ally creature token.";
const BEND_TEXT =
  "Waterbend {X}: Creatures you control have base power and toughness X/X until end of turn. X can't be 0. Activate only during your turn.";

export default defineCard({
  name: "Katara, Water Tribe's Hope",
  manaCost: "{2}{W}{U}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Ally"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${ENTER_TEXT}\n${BEND_TEXT} (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Ally Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}", tap: false, waterbend: true },
      minX: 1,
      condition: { kind: "your-turn" },
      targets: [],
      effect: {
        kind: "animate-all",
        filter: { type: "creature", controlledBy: "you" },
        power: "x",
        toughness: "x",
        duration: "end-of-turn",
      },
      resolve: null,
      text: BEND_TEXT,
    },
  ],
});
