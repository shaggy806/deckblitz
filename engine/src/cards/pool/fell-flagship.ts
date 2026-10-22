import { defineCard } from "../define.js";

// EDHREC rank 12606. Ixalan. Crew is Shadowed Caravel's; the discard is
// Orzhov Racketeers'.
const ANTHEM = "Pirates you control get +1/+0.";
const DISCARD = "Whenever this Vehicle deals combat damage to a player, that player discards a card.";

export default defineCard({
  name: "Fell Flagship",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 3,
  text: `${ANTHEM}\n${DISCARD}\nCrew 3 (Tap any number of creatures you control with total power 3 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Pirate" },
      grantPt: [1, 0],
      text: ANTHEM,
    },
  ],
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 3, filter: { type: "creature" } },
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
      text: "Crew 3",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 1 },
      resolve: null,
      text: DISCARD,
    },
  ],
});
