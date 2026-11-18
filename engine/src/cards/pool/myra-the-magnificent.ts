import { defineCard } from "../define.js";

// EDHREC rank 15211.
//
// The activated ability targets only the card (its ruling); the Attraction is
// chosen as it resolves, and gets the midway counter whether or not the exile
// happened. "For as long as that Attraction is on the battlefield, whenever you
// visit it" is a delayed ability (rule 603.7) watching that Attraction in this
// stint on the battlefield (rule 400.7): it goes on triggering after Myra has
// left or lost her abilities, and stops once the exiled card has left exile
// (`until: "while-exiled"`, its ruling) — an Attraction that left and came back
// is a new object it never sees. With no Attraction to choose, nothing watches.
const OPEN = "Whenever you cast an instant or sorcery spell from your hand, open an Attraction.";
const EXILE =
  "{X}, {T}: Exile target instant or sorcery card with mana value X from your graveyard and choose an Attraction " +
  "you control that doesn't have a midway counter on it. Put a midway counter on it. For as long as that " +
  "Attraction is on the battlefield, whenever you visit it, copy the exiled card. You may cast the copy without " +
  "paying its mana cost.";
const VISIT =
  "Whenever you visit that Attraction, copy the exiled card. You may cast the copy without paying its mana cost.";

export default defineCard({
  name: "Myra the Magnificent",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Performer"],
  power: 2,
  toughness: 4,
  text: `${OPEN}\n${EXILE}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", from: "hand", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "open-attraction" },
      resolve: null,
      text: OPEN,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "eq", n: "x" } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "choose-permanents",
            filter: {
              subtype: "Attraction",
              controlledBy: "you",
              counters: { kind: "midway", compare: { op: "eq", n: 0 } },
            },
            min: 1,
            upTo: 1,
            // Together: the pick is what this resolution "chose this way",
            // the set the delayed ability watches.
            thenTogether: true,
            then: { kind: "add-counter", target: 0, counter: "midway", amount: 1 },
            prompt: "Choose an Attraction you control without a midway counter — you'll copy the exiled card whenever you visit it",
          },
          {
            kind: "delayed-trigger",
            about: "exiled",
            at: {
              whenever: { on: "event", event: "visited", who: "self", by: "you" },
              watching: { thisWay: "chosen" },
              until: "while-exiled",
            },
            effect: { kind: "cast-now", from: "targets", copies: 1, free: true },
            text: VISIT,
          },
        ],
      },
      resolve: null,
      text: EXILE,
    },
  ],
});
