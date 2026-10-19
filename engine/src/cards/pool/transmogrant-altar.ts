import { defineCard } from "../define.js";

// EDHREC rank 10852.
//
// Phyrexian Tower's sacrifice-for-mana (a mana ability with a chosen
// sacrifice, so it's activated by hand and the mana floats), with {B} in the
// cost; and a sorcery-speed sacrifice for a 3/3 colorless Zombie artifact.

const MANA_TEXT = "{B}, {T}, Sacrifice a creature: Add {C}{C}{C}.";
const TOKEN_TEXT =
  "{2}, {T}, Sacrifice a creature: Create a 3/3 colorless Zombie artifact creature token. Activate only as a sorcery.";

export default defineCard({
  name: "Transmogrant Altar",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${MANA_TEXT}\n${TOKEN_TEXT}`,
  activated: [
    {
      cost: { mana: "{B}", tap: true, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 3 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{2}", tap: true, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token (Transmogrant Altar)", count: 1 },
      resolve: null,
      sorcerySpeed: true,
      text: TOKEN_TEXT,
    },
  ],
});
