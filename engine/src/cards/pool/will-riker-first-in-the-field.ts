import { defineCard } from "../define.js";

// EDHREC rank 27436.

const TEXT =
  "At the beginning of combat on your turn, reveal cards from the top of your library until you reveal two land cards. Put those land cards onto the battlefield and the rest on the bottom of your library in a random order. Sacrifice those lands at the beginning of your next end step.";

// One delayed ability for both lands (rule 603.7), about the lands this
// resolution put onto the battlefield; it sacrifices them together.
export default defineCard({
  name: "Will Riker, First in the Field",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "reveal-until-count", filter: { type: "land" }, count: 2, put: "battlefield", rest: "bottom-random" },
          {
            kind: "delayed-trigger",
            at: "your-next-end-step",
            about: "put-onto-battlefield",
            effect: { kind: "for-each-target", from: 0, effect: { kind: "sacrifice-target", target: 0 }, simultaneous: true },
            text: "Sacrifice those lands.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
