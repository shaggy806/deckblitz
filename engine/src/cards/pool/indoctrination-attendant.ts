import { defineCard } from "../define.js";

// EDHREC rank 13468.
// Makes Phyrexian Mite → use "Phyrexian Mite Token".
//
// The return is a choice on resolution, not a target (Ambrosia Whiteheart's shape). "If you do"
// reads what was actually returned to a hand this way, so a commander its owner sends to the
// command zone instead makes no Mite.

const ENTERS_TEXT =
  "When this creature enters, you may return another permanent you control to its owner's hand. If you do, create a 1/1 colorless Phyrexian Mite artifact creature token with toxic 1 and \"This token can't block.\"";

export default defineCard({
  name: "Indoctrination Attendant",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Cleric"],
  power: 3,
  toughness: 4,
  toxic: 1,
  text: `Toxic 1 (Players dealt combat damage by this creature also get a poison counter.)\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { controlledBy: "you" },
            min: 0,
            upTo: 1,
            exceptSource: true,
            then: { kind: "return-to-hand", target: 0 },
            prompt: "Return another permanent you control to its owner's hand?",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "returned-to-hand" },
            then: { kind: "create-token", token: "Phyrexian Mite Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
