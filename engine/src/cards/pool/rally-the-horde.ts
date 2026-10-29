import { defineCard } from "../define.js";

// EDHREC rank 26857.
//
// The process is three exiles, one card at a time, repeated while the third
// isn't a land. Written as two exiles, then a repeated pass of "exile one; if
// it isn't a land, exile two more" that goes again while the pass exiled all
// three: the same exiles in the same order, each pass's first card being the
// last card of a process. A library that runs out ends it. The Warriors
// count every nonland card the whole spell exiled.

const ONE = { kind: "exile-from-library", amount: 1 } as const;

export default defineCard({
  name: "Rally the Horde",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Exile the top card of your library. Exile the top card of your library. Exile the top card of your library. If the last card exiled isn't a land card, repeat this process. Create a 1/1 red Warrior creature token for each nonland card exiled this way.",
  effect: {
    kind: "sequence",
    effects: [
      ONE,
      ONE,
      {
        kind: "repeat",
        effect: {
          kind: "sequence",
          effects: [
            ONE,
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", filter: { notTypes: ["land"] } },
              then: { kind: "sequence", effects: [ONE, ONE] },
            },
          ],
        },
        again: { kind: "this-way", what: "exiled", atLeast: 3 },
      },
      {
        kind: "create-token",
        token: "Red Warrior Token",
        count: { thisWay: "exiled", filter: { notTypes: ["land"] } },
      },
    ],
  },
});
