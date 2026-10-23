import { defineCard } from "../define.js";

const COPY_TEXT =
  "{2}{U}, Exile this card from your graveyard: Copy target instant or sorcery spell you control. You may choose new targets for the copy.";

// A graveyard ability without `staysInZone` exiles the card as its cost
// (Bramble Wurm); the copy keeps the original's division, X and paid
// alternative cost (the rulings — `copy-spell`).
export default defineCard({
  name: "Geistblast",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Geistblast deals 2 damage to any target.\n${COPY_TEXT}`,
  targets: ["any-target"],
  effect: { kind: "damage", amount: 2, target: 0 },
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      zone: "graveyard",
      targets: [{ kind: "spell", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: { kind: "copy-spell", target: 0, newTargets: true },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
