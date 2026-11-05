import { defineCard } from "../define.js";

// The last ability picks at random among the creatures declared as attackers
// this turn and still on the battlefield — one put onto the battlefield
// attacking never attacked, and one removed from combat still did (the
// rulings); hexproof and indestructible don't stop the choice.
export default defineCard({
  name: "Metzali, Tower of Triumph",
  art: "https://cards.scryfall.io/art_crop/back/6/6/66d9d524-3611-48d9-86c9-48e509e8ae70.jpg",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: "(Transforms from Path of Mettle.)\n{T}: Add one mana of any color.\n{1}{R}, {T}: Metzali deals 2 damage to each opponent.\n{2}{W}, {T}: Choose a creature at random that attacked this turn. Destroy that creature.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: { mana: "{1}{R}", tap: true },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: "{1}{R}, {T}: Metzali deals 2 damage to each opponent.",
    },
    {
      cost: { mana: "{2}{W}", tap: true },
      targets: [],
      effect: {
        kind: "choose-permanents",
        random: true,
        filter: { type: "creature", attackedThisTurn: true },
        upTo: 1,
        prompt: "A creature that attacked this turn, at random",
        then: { kind: "destroy", target: 0 },
      },
      resolve: null,
      text: "{2}{W}, {T}: Choose a creature at random that attacked this turn. Destroy that creature.",
    },
  ],
  faces: ["Path of Mettle", "Metzali, Tower of Triumph"],
  transform: true,
});
