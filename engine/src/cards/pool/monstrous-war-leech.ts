import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 26510.
//
// The mill is part of the replacement as it enters (rules 614.1c, 614.12),
// not a trigger: nobody can respond, and it enters with power and toughness
// counting the cards it milled (the rulings). Its CDA (rule 604.3) is the
// greatest mana value among the cards in its owner's graveyard, an {X} there
// 0 (202.3e), itself among them while it's there.
const MILL_TEXT = "As this creature enters, if it was kicked, mill four cards.";
const PT_TEXT = "Monstrous War-Leech's power and toughness are each equal to the greatest mana value among cards in your graveyard.";

export default defineCard({
  name: "Monstrous War-Leech",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Leech", "Horror"],
  power: 0,
  toughness: 0,
  text: `Kicker {U} (You may pay an additional {U} as you cast this spell.)\n${MILL_TEXT} (To mill a card, put the top card of your library into your graveyard.)\n${PT_TEXT}`,
  kicker: { cost: "{U}" },
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        asEnters: { mill: { ifCondition: { kind: "self-kicked" }, then: 4, else: 0 } },
      },
      text: MILL_TEXT,
    },
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { aggregate: "max", of: "mana-value", filter: { ownedBy: "you" }, in: "graveyards" },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});
