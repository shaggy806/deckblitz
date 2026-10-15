import { defineCard } from "../define.js";

// EDHREC rank 21432.
//
// "Rhinos you control have menace" is every Rhino permanent you control —
// Bebop himself isn't one (a Boar), and has menace of his own.

const RHINO_TEXT = "Rhinos you control have menace.";

export default defineCard({
  name: "Bebop, Warthog Warrior",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Boar", "Mutant", "Warrior"],
  power: 5,
  toughness: 4,
  keywords: ["menace"],
  cycling: { cost: "{2}", search: { subtype: "Swamp" } },
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${RHINO_TEXT}\nSwampcycling {2} ({2}, Discard this card: Search your library for a Swamp card, reveal it, put it into your hand, then shuffle.)`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Rhino", controlledBy: "you" } },
      grantKeywords: ["menace"],
      text: RHINO_TEXT,
    },
  ],
});
