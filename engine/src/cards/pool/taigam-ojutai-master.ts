import { defineCard } from "../define.js";

// "That spell gains rebound": read as it resolves, and only a spell cast from
// the hand rebounds, which the trigger asks too (rule 702.88a).

const COUNTER_TEXT = "Instant, sorcery, and Dragon spells you control can't be countered.";
const REBOUND_TEXT =
  "Whenever you cast an instant or sorcery spell from your hand, if Taigam attacked this turn, that spell gains rebound. (Exile the spell as it resolves. At the beginning of your next upkeep, you may cast that card from exile without paying its mana cost.)";

export default defineCard({
  name: "Taigam, Ojutai Master",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 3,
  toughness: 4,
  text: `${COUNTER_TEXT}\n${REBOUND_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: {
        cantBeCountered: true,
        filter: { anyOf: [{ typesAnyOf: ["instant", "sorcery"] }, { subtype: "Dragon" }] },
      },
      text: COUNTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", from: "hand", filter: { typesAnyOf: ["instant", "sorcery"] } },
      condition: { kind: "source", filter: { attackedThisTurn: true } },
      targets: [],
      effect: { kind: "grant-keyword", target: "trigger-object", keyword: "rebound", duration: "permanent" },
      resolve: null,
      text: REBOUND_TEXT,
    },
  ],
});
