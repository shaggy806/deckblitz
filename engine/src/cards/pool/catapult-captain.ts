import { defineCard } from "../define.js";

/** The back face of Catapult Fodder. The sacrificed creature's toughness is
 * read as it last existed on the battlefield (rule 608.2h). */
const TEXT =
  "{2}{B}, {T}, Sacrifice another creature: Target opponent loses life equal to the sacrificed creature's toughness.";

export default defineCard({
  name: "Catapult Captain",
  art: "https://cards.scryfall.io/art_crop/back/e/6/e61b3afa-66e0-4f7b-84bc-7ae2cc6d28d4.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 6,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: true, sacrifice: "creature-you-control" },
      otherOnly: true,
      targets: ["opponent"],
      effect: { kind: "lose-life", amount: { toughnessOf: "sacrificed" }, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Catapult Fodder", "Catapult Captain"],
  transform: true,
});
