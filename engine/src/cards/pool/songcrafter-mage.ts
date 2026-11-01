import { defineCard } from "../define.js";

// EDHREC rank 12912.
const ETB_TEXT =
  "When this creature enters, target instant or sorcery card in your graveyard gains harmonize until end of turn. Its harmonize cost is equal to its mana cost. (You may cast that card from your graveyard for its harmonize cost. You may tap a creature you control to reduce that cost by {X}, where X is its power. Then exile the spell.)";

export default defineCard({
  name: "Songcrafter Mage",
  manaCost: "{G}{U}{R}",
  colors: ["G", "U", "R"],
  types: ["creature"],
  subtypes: ["Human", "Bard"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: { kind: "grant-graveyard-keyword", target: 0, grant: { keyword: "harmonize" } },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
