import { defineCard } from "../define.js";

// The Magic Mirror's cost reduction; Torrential Gearhulk's free cast, from
// your own graveyard. The spell is cast while the trigger resolves, timing
// ignored, additional costs payable, X = 0 (the rulings — `cast-now`).
const COST_TEXT = "This spell costs {1} less to cast for each instant and sorcery card in your graveyard.";
const ATTACK_TEXT =
  "Whenever The Dawning Archaic attacks, you may cast target instant or sorcery card from your graveyard without paying its mana cost. If that spell would be put into your graveyard, exile it instead.";

export default defineCard({
  name: "The Dawning Archaic",
  manaCost: "{10}",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 7,
  toughness: 7,
  keywords: ["reach"],
  text: `${COST_TEXT}\nReach\n${ATTACK_TEXT}`,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { cardsInGraveyard: { typesAnyOf: ["instant", "sorcery"] } },
  },
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: { kind: "cast-now", target: 0, free: true, exileAfter: true },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
