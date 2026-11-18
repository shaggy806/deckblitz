import { defineCard } from "../define.js";
import { partnerWithTrigger } from "../helpers.js";

// EDHREC rank 15515. Battlebond.
//
// Two requirements (rule 509.1c): "must be blocked if able", which one
// blocker obeys, and "must be blocked by two or more creatures if able",
// which only two or more do. With two able, both are obeyed; with only one
// able, it blocks Gorm alone (the ruling); none is forced to pay a cost to
// block, or to break a restriction.
const BLOCK_TEXT = "Gorm must be blocked if able, and Gorm must be blocked by two or more creatures if able.";

export default defineCard({
  name: "Gorm the Great",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 2,
  toughness: 7,
  keywords: ["vigilance"],
  pairing: { kind: "partner-with", name: "Virtus the Veiled" },
  text: `Partner with Virtus the Veiled (When this creature enters, target player may put Virtus into their hand from their library, then shuffle.)\nVigilance\n${BLOCK_TEXT}`,
  triggered: [partnerWithTrigger("Virtus the Veiled")],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-be-blocked-if-able", { kind: "must-be-blocked-if-able", byAtLeast: 2 }],
      text: BLOCK_TEXT,
    },
  ],
});
