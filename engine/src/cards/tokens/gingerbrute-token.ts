import { defineCard } from "../define.js";

/** The Gingerbrute token (Ginger, Queen of Sweets): a copy of the card Gingerbrute
 * in the Oracle card reference, so named Gingerbrute, with its {1} mana cost (the
 * token's own reminder: "This token's mana cost is {1}"). */
const DODGE = "{1}: This token can't be blocked this turn except by creatures with haste.";
const SNACK = "{2}, {T}, Sacrifice this token: You gain 3 life.";

export default defineCard({
  name: "Gingerbrute Token",
  tokenName: "Gingerbrute",
  art: "dc2dff97-a68b-497f-a004-1e14ba5116ea",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Food", "Golem"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${DODGE}\n${SNACK}\n(This token's mana cost is {1}.)`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "restrict", target: "source", restrictions: [{ kind: "cant-be-blocked", by: { notKeyword: "haste" } }]},
      resolve: null,
      text: DODGE,
    },
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: SNACK,
    },
  ],
});
