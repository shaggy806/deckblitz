import { defineCard } from "../define.js";

// EDHREC rank 16701. Future Sight.
//
// Grandeur as Skoa, Embermage writes it: discarding a card with Korlash's
// name is the cost (Korlash itself is on the battlefield, so any card so
// named in hand is "another").

const PT_TEXT = "Korlash's power and toughness are each equal to the number of Swamps you control.";
const REGEN_TEXT = "{1}{B}: Regenerate Korlash.";
const GRANDEUR_TEXT =
  "Grandeur — Discard another card named Korlash, Heir to Blackblade: Search your library for up to two Swamp cards, put them onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Korlash, Heir to Blackblade",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Warrior"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${REGEN_TEXT}\n${GRANDEUR_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Swamp", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: REGEN_TEXT,
    },
    {
      cost: { mana: null, tap: false, discard: { count: 1, filter: { name: "Korlash, Heir to Blackblade" } } },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtype: "Swamp" },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: 2,
      },
      resolve: null,
      text: GRANDEUR_TEXT,
    },
  ],
});
