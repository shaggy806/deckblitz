import { defineCard } from "../define.js";

const LOOK_TEXT = "You may look at the top card of your library any time.";
const CAST_TEXT = "You may cast artifact spells from the top of your library.";
const GRANT_TEXT =
  'Artifacts you control have "{T}: Add {U}. Spend this mana only to cast a spell from anywhere other than your hand."';

export default defineCard({
  name: "Mm'menon, the Right Hand",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Jellyfish", "Advisor"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${LOOK_TEXT}\n${CAST_TEXT}\n${GRANT_TEXT}`,
  static: [
    { affects: { scope: "self" }, visibility: { looksAtOwnLibraryTop: true }, text: LOOK_TEXT },
    { affects: { scope: "self" }, mayPlay: { from: "library-top", filter: { type: "artifact" } }, text: CAST_TEXT },
    {
      affects: { scope: "filter", filter: { type: "artifact", controlledBy: "you" } },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: {
            kind: "add-mana",
            mana: "U",
            amount: 1,
            spendOnly: {
              castFrom: { notZones: ["hand"] },
              text: "Spend this mana only to cast a spell from anywhere other than your hand.",
            },
          },
          resolve: null,
          text: "{T}: Add {U}. Spend this mana only to cast a spell from anywhere other than your hand.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
