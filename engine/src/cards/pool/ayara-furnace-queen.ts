import { defineCard } from "../define.js";

// Back face of Ayara, Widow of the Realm. The return is Postmortem Lunge's:
// it gains haste, and a delayed trigger exiles it at the next end step.

const TEXT =
  "At the beginning of combat on your turn, return up to one target artifact or creature card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step.";

export default defineCard({
  name: "Ayara, Furnace Queen",
  art: "https://cards.scryfall.io/art_crop/back/a/2/a21b1734-a773-4107-95c1-b44d5ccdfd82.jpg",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Elf", "Noble"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [
        {
          kind: "optional",
          of: { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
          {
            kind: "delayed-trigger",
            at: { step: "end" },
            effect: { kind: "exile", target: 0 },
            text: "Exile the card Ayara returned to the battlefield.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Ayara, Widow of the Realm", "Ayara, Furnace Queen"],
  transform: true,
});
