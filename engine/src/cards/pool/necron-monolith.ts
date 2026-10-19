import { defineCard } from "../define.js";

// EDHREC rank 11098.
//
// Tribune of Rot's attack trigger (the Warriors counted off the cards this
// resolution milled) on Night Scythe's crew.

const GATE_TEXT =
  "Eternity Gate — Whenever this Vehicle attacks, mill three cards. For each creature card milled this way, create a 2/2 black Necron Warrior artifact creature token.";

export default defineCard({
  name: "Necron Monolith",
  manaCost: "{7}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 7,
  toughness: 7,
  keywords: ["flying", "indestructible"],
  text: `Flying, indestructible\n${GATE_TEXT}\nCrew 4 (Tap any number of creatures you control with total power 4 or more: This Vehicle becomes an artifact creature until end of turn.)`,
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
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "create-token",
            token: "Necron Warrior Token",
            count: { thisWay: "milled", filter: { type: "creature" } },
          },
        ],
      },
      resolve: null,
      text: GATE_TEXT,
    },
  ],
});
