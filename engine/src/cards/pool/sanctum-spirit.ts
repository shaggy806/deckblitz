import { defineCard } from "../define.js";

// EDHREC rank 29484. Dominaria.
//
// Rulings:
//   [2018-04-27] A card, spell, or permanent is historic if it has the legendary supertype, the
//     artifact card type, or the Saga subtype.

const TEXT =
  "Discard a historic card: This creature gains indestructible until end of turn. (Artifacts, legendaries, and Sagas are historic.)";

export default defineCard({
  name: "Sanctum Spirit",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        discard: { count: 1, filter: { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] } },
      },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
