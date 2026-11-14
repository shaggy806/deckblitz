import { defineCard } from "../define.js";

// EDHREC rank 10200.
//
// The card is chosen at random as the trigger resolves, with no target
// (Charmbreaker Devils' shape), then exiled with a cast-this-turn permission
// whose spell is exiled instead of going to a graveyard (Dire Fleet
// Daredevil's `exileAfter`). Its costs and timing are the card's own (the
// ruling). The lifelink is the spells' own keyword, so only damage a spell
// itself deals gains life (the rulings).

const LIFELINK_TEXT = "Instant and sorcery spells you control have lifelink.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, exile an instant or sorcery card at random from your graveyard. You may cast it this turn. If a spell cast this way would be put into your graveyard, exile it instead.";

export default defineCard({
  name: "Radiant Scrollwielder",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Cleric"],
  power: 2,
  toughness: 4,
  text: `${LIFELINK_TEXT}\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { typesAnyOf: ["instant", "sorcery"] }, keywords: ["lifelink"] },
      text: LIFELINK_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "choose-random-card",
        zone: "graveyard",
        filter: { typesAnyOf: ["instant", "sorcery"] },
        then: { kind: "exile", target: 0, mayPlay: { duration: "end-of-turn", exileAfter: true } },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
