import { defineCard } from "../define.js";

// Planar Chaos (PLC). Both anthems reach every player's creatures. The -1/-1
// reads "nonwhite creatures", so it reaches Crovax itself once it isn't
// white (the ruling); the +1/+1 is "other".
const WHITE = "Other white creatures get +1/+1.";
const NONWHITE = "Nonwhite creatures get -1/-1.";
const BOUNCE = "Pay 2 life: Return Crovax to its owner's hand.";

export default defineCard({
  name: "Crovax, Ascendant Hero",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 4,
  toughness: 4,
  text: `${WHITE}\n${NONWHITE}\n${BOUNCE}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["W"] }, excludeSelf: true },
      grantPt: [1, 1],
      text: WHITE,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", notColors: ["W"] } },
      grantPt: [-1, -1],
      text: NONWHITE,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 2 },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: BOUNCE,
    },
  ],
});
