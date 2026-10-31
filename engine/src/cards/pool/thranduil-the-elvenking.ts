import { defineCard } from "../define.js";

// "Your graveyard": the Elf cards you own (a card goes to its owner's
// graveyard, rule 404.2), read live.
const GRANT_TEXT = "Thranduil has all activated abilities of all Elf cards in your graveyard.";
const DRAW_TEXT = "Whenever another legendary Elf you control enters, draw two cards, then discard a card.";

export default defineCard({
  name: "Thranduil, the Elvenking",
  manaCost: "{2}{B}{G}{U}",
  colors: ["B", "G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Noble"],
  power: 5,
  toughness: 6,
  text: `${GRANT_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsActivatedOf: { zone: "graveyard", filter: { subtype: "Elf", ownedBy: "you" } },
      text: GRANT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { subtype: "Elf", supertype: "legendary" },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
