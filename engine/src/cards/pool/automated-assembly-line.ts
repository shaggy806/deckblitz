import { defineCard } from "../define.js";

// EDHREC rank 7621. Fallout.
//
// Thopter Spy Network's batched trigger: once per player dealt combat damage
// by one or more of your artifact creatures in one damage step. The tokens
// are made tapped.
const DAMAGE_TEXT =
  "Whenever one or more artifact creatures you control deal combat damage to a player, you get {E} (an energy counter).";
const MAKE_TEXT = "Pay {E}{E}{E}: Create a tapped 3/3 colorless Robot artifact creature token.";

export default defineCard({
  name: "Automated Assembly Line",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: `${DAMAGE_TEXT}\n${MAKE_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "deals-damage-batch",
        who: "you-control",
        filter: { types: ["artifact", "creature"] },
        combat: true,
      },
      targets: [],
      effect: { kind: "get-energy", amount: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 3 },
      targets: [],
      effect: { kind: "create-token", token: "Robot Token (Automated Assembly Line)", count: 1, tapped: true },
      resolve: null,
      text: MAKE_TEXT,
    },
  ],
});
