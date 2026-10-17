import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// The spell itself goes to exile with three time counters and suspend — so
// it's cast again from there, where this doesn't trigger. Countered in
// response, it's a new object in the graveyard and isn't exiled; the Clue
// is still made.
const CENTURION_TEXT =
  "The Last Centurion — When you cast this spell from anywhere other than exile, exile it with three time counters on it. It gains suspend. Then investigate.";

export default defineCard({
  name: "Rory Williams",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike", "lifelink"],
  pairing: { kind: "partner-with", name: "Amy Pond" },
  text: `Partner with Amy Pond\nFirst strike, lifelink\n${CENTURION_TEXT} (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Amy Pond?",
        effect: {
          kind: "search-library",
          filter: { name: "Amy Pond" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Amy Pond, reveal it, put it into their hand, then shuffle.",
    },
    {
      trigger: { on: "this-cast", notFrom: "exile" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "give-suspend", target: "source", timeCounters: 3 }, investigate()],
      },
      resolve: null,
      text: CENTURION_TEXT,
    },
  ],
});
