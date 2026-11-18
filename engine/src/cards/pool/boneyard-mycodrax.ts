import { defineCard } from "../define.js";
import { scavenge } from "../helpers.js";

// Commander 2020 (C20). EDHREC rank 15674.
//
// A characteristic-defining ability (rule 604.3), working in every zone: in
// the graveyard it doesn't count itself, and scavenge (702.97a) reads its
// power as it last existed there (the ability's record of the card it
// exiled), so a creature card put there in response changes nothing.
const PT_TEXT =
  "Boneyard Mycodrax's power and toughness are each equal to the number of other creature cards in your graveyard.";
const SCAVENGE =
  "Scavenge {4}{B} ({4}{B}, Exile this card from your graveyard: Put a number of +1/+1 counters equal to this card's power on target creature. Scavenge only as a sorcery.)";

export default defineCard({
  name: "Boneyard Mycodrax",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${SCAVENGE}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: {
          aggregate: "count",
          filter: { type: "creature", ownedBy: "you" },
          in: "graveyards",
          excludeSelf: true,
        },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
  activated: [scavenge("{4}{B}")],
});
