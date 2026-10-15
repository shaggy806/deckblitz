import { defineCard } from "../define.js";
import { PREPARED_REMINDER } from "../helpers.js";

// EDHREC rank 11996. Secrets of Strixhaven Commander. A preparation card
// (rule 722): its prepare spell is Restore Relic, a spell with no card of its
// own (`prepareSpellOnly`). An intervening "if" (rule 603.4): asked as the
// upkeep begins and again on resolution (the ruling).
const UPKEEP_TEXT =
  "At the beginning of your upkeep, if there are three or more artifact and/or creature cards in your graveyard, this creature becomes prepared.";

export default defineCard({
  name: "Lorehold Archivist",
  manaCost: "{1}{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Artificer"],
  power: 3,
  toughness: 2,
  keywords: ["first-strike"],
  prepareSpell: "Restore Relic",
  text: `First strike\n${UPKEEP_TEXT} ${PREPARED_REMINDER}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "cards-in-graveyard", atLeast: 3, filter: { typesAnyOf: ["artifact", "creature"] } },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
