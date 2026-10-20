import { defineCard } from "../define.js";

// EDHREC rank 11297. Cryptic Coat's shape for "that land": the one card the
// search put onto the battlefield, chosen as the only candidate. The count
// is every land that entered under your control this turn, as it entered —
// the found land included (the ruling), one that has left since too. It
// isn't a creature as it enters, so creature-enters triggers don't see it.

export default defineCard({
  name: "Emergent Sequence",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for a basic land card, put it onto the battlefield tapped, then shuffle. That land becomes a 0/0 green and blue Fractal creature that's still a land. Put a +1/+1 counter on it for each land you had enter the battlefield under your control this turn.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      {
        kind: "choose-permanents",
        filter: { type: "land", thisWay: "put-onto-battlefield" },
        min: 1,
        upTo: 1,
        prompt: "That land becomes a 0/0 Fractal creature",
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "animate",
              target: 0,
              power: 0,
              toughness: 0,
              addTypes: ["creature"],
              addSubtypes: ["Fractal"],
              setColors: ["G", "U"],
              duration: "permanent",
            },
            {
              kind: "add-counter",
              target: 0,
              counter: "+1/+1",
              amount: { turnHistory: "entered", filter: { type: "land" } },
            },
          ],
        },
      },
    ],
  },
});
