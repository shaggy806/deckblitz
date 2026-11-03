import { defineCard } from "../define.js";

// Not linked to Mairsil: every card its controller owns in exile with a cage
// counter counts, from any Mairsil or stint. Each card's ability has its own
// once-a-turn limit, so two cards with one ability are two activations.
const ENTER_TEXT =
  "When Mairsil enters, you may exile an artifact or creature card from your hand or graveyard and put a cage counter on it.";
const GRANT_TEXT =
  "Mairsil has all activated abilities of all cards you own in exile with cage counters on them. You may activate each of those abilities only once each turn.";

export default defineCard({
  name: "Mairsil, the Pretender",
  manaCost: "{1}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT}\n${GRANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile an artifact or creature card from your hand or graveyard with a cage counter on it?",
        effect: {
          kind: "return-from-graveyard",
          filter: { typesAnyOf: ["artifact", "creature"] },
          destination: "exile",
          count: 1,
          from: "hand-or-graveyard",
          withCounters: { kind: "cage", amount: 1 },
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantsActivatedOf: {
        zone: "exile",
        filter: { ownedBy: "you", counters: { kind: "cage", compare: { op: "gte", n: 1 } } },
        onceEach: true,
      },
      text: GRANT_TEXT,
    },
  ],
});
