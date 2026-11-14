import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// EDHREC rank 5461.
//
// Rulings:
//   You may choose to return Cosima to the battlefield even if it doesn't have any voyage
//     counters on it. If you do, it won't enter with any +1/+1 counters on it and you won't draw
//     any cards.
//   While the triggered ability Cosima gains is resolving, if you don't put a voyage counter on
//     Cosima, you'll immediately return it to the battlefield and draw cards equal to the number
//     of voyage counters Cosima had on it in exile. Players can't respond to this choice, and no
//     player may take actions during this process.
//   If a land enters the battlefield under your control while Cosima is exiled and has the added
//     triggered ability, that ability will trigger. As the ability tries to resolve, it will
//     check to see if Cosima is still in exile. If Cosima has left exile before the ability tries
//     to resolve, it won't resolve and none of its effects will happen. This is true even if
//     Cosima returns to exile before that ability tries to resolve.
//   Cosima's ability triggers only if Cosima is on the battlefield at the beginning of your
//     upkeep, and you may exile Cosima only if it is still on the battlefield as the ability
//     resolves.
//   If an effect puts a double-faced card onto the battlefield, it enters with its front face up.
//   (The rest are the modal double-faced cards' rulings: see The Omenkeel.)

const VOYAGE_TEXT =
  "Whenever a land you control enters, if Cosima is exiled, you may put a voyage counter on it. If you don't, return Cosima to the battlefield with X +1/+1 counters on it and draw X cards, where X is the number of voyage counters on it.";
const UPKEEP_TEXT = `At the beginning of your upkeep, you may exile Cosima. If you do, it gains "${VOYAGE_TEXT}"`;

/** What Cosima gains in exile, and works there only (rule 113.6k). */
const VOYAGE: TriggeredAbility = {
  fromExile: true,
  trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
  // "If Cosima is exiled": still the card that gained this (rule 400.7 — one
  // that left exile and came back is a new object, the ruling).
  condition: { kind: "source-zone", zones: ["exile"], sameObject: true },
  targets: [],
  effect: {
    kind: "may",
    prompt: "Put a voyage counter on Cosima? (If you don't, return it to the battlefield.)",
    effect: { kind: "add-counter", target: "source", counter: "voyage", amount: 1 },
    // X: the voyage counters it has in exile, read before it returns —
    // they cease to exist as it moves (rule 122.2).
    else: {
      kind: "with-x",
      x: { countersOn: "source", counter: "voyage" },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: "source", withCounters: { kind: "+1/+1", amount: "x" } },
          { kind: "draw", amount: "x" },
        ],
      },
    },
  },
  resolve: null,
  text: VOYAGE_TEXT,
};

export default defineCard({
  name: "Cosima, God of the Voyage",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God"],
  power: 2,
  toughness: 4,
  text: UPKEEP_TEXT,
  faces: ["Cosima, God of the Voyage", "The Omenkeel"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile Cosima? It gains a landfall ability in exile.",
        effect: { kind: "exile", target: "source" },
        // "It": the card exiled this way, gaining it there for as long as it
        // stays (a new object once it leaves, rule 400.7).
        then: { kind: "grant-triggered", target: { thisWay: "exiled" }, ability: VOYAGE, duration: "permanent" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
