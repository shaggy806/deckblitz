import { defineCard } from "../define.js";

export default defineCard({
  name: "Goka the Unjust",
  art: "https://cards.scryfall.io/art_crop/front/b/3/b3523b8e-065f-427c-8d5b-eb731ca91ede.jpg",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ogre", "Shaman"],
  power: 4,
  toughness: 4,
  text: "{T}: Goka deals 4 damage to target creature that was dealt damage this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", damagedThisTurnBy: {} } }],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: "{T}: Goka deals 4 damage to target creature that was dealt damage this turn.",
    },
  ],
  faces: ["Initiate of Blood", "Goka the Unjust"],
  flip: true,
});
