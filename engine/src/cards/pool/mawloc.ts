import { defineCard } from "../define.js";
import { ravenous } from "../helpers.js";

// EDHREC rank 7360.
//
// Ravenous (rule 702.156a) is its two abilities: enters with X +1/+1 counters,
// and "when it enters, if X is 5 or more, draw a card" — X being the X it was
// cast with (the ruling; 0 entered any other way), which can't change, so it
// is read as the trigger resolves (Kinetic Ooze's shape). The fought creature
// is exiled if it would die this turn from any cause, even with Mawloc gone.
const RAVENOUS = ravenous();
const RAVENOUS_TEXT =
  "Ravenous (This creature enters with X +1/+1 counters on it. If X is 5 or more, draw a card when it enters.)";
const TERROR_TEXT =
  "Terror from the Deep — When this creature enters, it fights up to one target creature an opponent controls. If that creature would die this turn, exile it instead.";

export default defineCard({
  name: "Mawloc",
  manaCost: "{X}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 2,
  toughness: 2,
  text: `${RAVENOUS_TEXT}\n${TERROR_TEXT}`,
  static: [RAVENOUS.static],
  triggered: [
    RAVENOUS.triggered,
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "fight", a: "source", b: 0 },
          { kind: "exile-if-dies-this-turn", target: 0 },
        ],
      },
      resolve: null,
      text: TERROR_TEXT,
    },
  ],
});
