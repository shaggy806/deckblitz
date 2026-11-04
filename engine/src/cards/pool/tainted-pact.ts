import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 885. "This way" inside a `repeat` is its pass; the
// `acrossPasses` conditions are over every card exiled so far. An empty library
// exiles nothing and ends the process.
const TWO_SAME_NAME = { kind: "this-way", what: "exiled", sharing: "name", atLeast: 2, acrossPasses: true } as const;

export default defineCard({
  name: "Tainted Pact",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Exile the top card of your library. You may put that card into your hand unless it has the same name as another card exiled this way. Repeat this process until you put a card into your hand or you exile two cards with the same name, whichever comes first.",
  effect: {
    kind: "repeat",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "exile-from-library", amount: 1 },
        {
          kind: "conditional",
          condition: { kind: "all", of: [{ kind: "this-way", what: "exiled" }, { kind: "not", of: TWO_SAME_NAME }] },
          then: {
            kind: "may",
            prompt: "Put that card into your hand?",
            effect: { kind: "move-exiled-this-way", to: "hand" },
          },
        },
      ],
    },
    again: {
      kind: "all",
      of: [
        { kind: "this-way", what: "exiled" },
        { kind: "not", of: { kind: "this-way", what: "put-into-hand" } },
        { kind: "not", of: TWO_SAME_NAME },
      ],
    },
  },
});
