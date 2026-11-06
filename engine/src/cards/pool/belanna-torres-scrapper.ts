import { defineCard } from "../define.js";

// Star Trek Commander (TRC). Not revealing, or revealing a nonartifact card,
// draws nothing, so B'Elanna gets the counters (Trade Route Envoy's "if you
// don't draw a card this way").

const TEXT =
  "{2}, {T}: Surveil 2, then you may reveal the top card of your library. Draw a card if it's an artifact card. If you don't draw a card this way, put two +1/+1 counters on B'Elanna Torres.";

export default defineCard({
  name: "B'Elanna Torres, Scrapper",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Human", "Artificer"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance", "trample"],
  text: `Vigilance, trample\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "surveil", amount: 2 },
          {
            kind: "may",
            prompt: "Reveal the top card of your library?",
            effect: {
              kind: "reveal-top",
              then: {
                kind: "conditional",
                condition: { kind: "target", index: 0, filter: { type: "artifact" } },
                then: { kind: "draw", amount: 1 },
              },
            },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "drawn", who: "you", atMost: 0 },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
