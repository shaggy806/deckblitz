import { defineCard } from "../define.js";

// Imprint is an ability word; the two abilities are linked (rule 607.2a):
// the first exiles each player's instant or sorcery spell cast from their
// hand "with" the Diary as it resolves (a replacement set up by the trigger,
// rule 614.1a — only a spell that resolves and would go to its owner's
// graveyard), and the second counts and picks among those cards. The pick is
// random as the ability resolves, and the cast is then and there (the
// ruling), timing ignored.
const IMPRINT_TEXT =
  "Imprint — Whenever a player casts an instant or sorcery spell from their hand, exile it instead of putting it " +
  "into a graveyard as it resolves.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, if there are four or more cards exiled with this artifact, choose one of them " +
  "at random. You may cast it without paying its mana cost.";

export default defineCard({
  name: "River Song's Diary",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Book"],
  text: `${IMPRINT_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", from: "hand", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "exile-spell-as-it-resolves", anyOwner: true, linked: true },
      resolve: null,
      text: IMPRINT_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "exiled-with-source", atLeast: 4, now: true },
      targets: [],
      effect: {
        kind: "choose-random-card",
        zone: "exiled-with-source",
        then: { kind: "cast-now", target: 0, free: true },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
