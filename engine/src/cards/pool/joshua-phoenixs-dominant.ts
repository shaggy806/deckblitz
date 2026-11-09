import { defineCard } from "../define.js";

// EDHREC rank 3684.
const LOOT_TEXT = "When Joshua enters, discard up to two cards, then draw that many cards.";

export default defineCard({
  name: "Joshua, Phoenix's Dominant",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Wizard"],
  power: 3,
  toughness: 4,
  text: `${LOOT_TEXT}\n{3}{R}{W}, {T}: Exile Joshua, then return it to the battlefield transformed under its owner's control. Activate only as a sorcery.`,
  activated: [
    {
      cost: { mana: "{3}{R}{W}", tap: true },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true },
      resolve: null,
      text: "{3}{R}{W}, {T}: Exile Joshua, then return it to the battlefield transformed under its owner's control. Activate only as a sorcery.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 0, anyNumber: true, atMost: 2 },
          { kind: "draw", amount: { thisWay: "discarded" } },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
  faces: ["Joshua, Phoenix's Dominant", "Phoenix, Warden of Fire"],
  transform: true,
});
