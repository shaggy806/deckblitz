import { defineCard } from "../define.js";
import { partnerWithTrigger } from "../helpers.js";

// EDHREC rank 22060. The kinds are read as each other Dinosaur enters, one
// counter of each kind Blue has then (two +1/+1 counters on Blue are one kind:
// one +1/+1 counter). A Dinosaur entering at the same time as Blue gets none
// (the ruling), nor does anything while Blue has no counters.

const PARTNER = "Owen Grady, Raptor Trainer";
const PARTNER_TEXT =
  `Partner with ${PARTNER} (When this creature enters, target player may put Owen into their hand from their ` +
  "library, then shuffle.)";
const KINDS_TEXT =
  "For each kind of counter on Blue, Loyal Raptor, each other Dinosaur you control enters with a counter of that " +
  "kind on it.";

export default defineCard({
  name: "Blue, Loyal Raptor",
  manaCost: "{2}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 5,
  toughness: 4,
  pairing: { kind: "partner-with", name: PARTNER },
  text: `${PARTNER_TEXT}\n${KINDS_TEXT}`,
  triggered: [partnerWithTrigger(PARTNER)],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { subtype: "Dinosaur", controlledBy: "you" },
        counterKindsOfSource: true,
      },
      text: KINDS_TEXT,
    },
  ],
});
