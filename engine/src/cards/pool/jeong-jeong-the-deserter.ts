import { defineCard } from "../define.js";
import { firebending } from "../helpers.js";

// EDHREC rank 10716. The exhaust ability (once per object — a new object
// after a zone change may activate it again) sets up Adaptive Training Post's
// "when you next cast … this turn, copy it" delayed trigger for a Lesson
// spell. The copy isn't cast, keeps the spell's X and additional costs, and
// it and the trigger resolve before the spell, even if that's countered (the
// rulings).
const FIREBENDING_TEXT =
  "Firebending 1 (Whenever this creature attacks, add {R}. This mana lasts until end of combat.)";
const EXHAUST_TEXT =
  "Exhaust — {3}: Put a +1/+1 counter on Jeong Jeong. When you next cast a Lesson spell this turn, copy it and you may choose new targets for the copy.";

export default defineCard({
  name: "Jeong Jeong, the Deserter",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Ally"],
  power: 2,
  toughness: 3,
  text: `${FIREBENDING_TEXT}\n${EXHAUST_TEXT} (Activate each exhaust ability only once.)`,
  triggered: [firebending(1, FIREBENDING_TEXT)],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          {
            kind: "delayed-trigger",
            at: { nextSpell: { subtype: "Lesson" } },
            effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
            text: "When you next cast a Lesson spell this turn, copy it and you may choose new targets for the copy.",
          },
        ],
      },
      resolve: null,
      text: EXHAUST_TEXT,
      exhaust: true,
    },
  ],
});
