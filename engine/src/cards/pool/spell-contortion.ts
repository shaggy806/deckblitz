import { defineCard } from "../define.js";

// Worldwake (WWK). Condescend's shape. The draw happens whether or not the
// {2} is paid (the ruling); with its target gone it doesn't resolve, and
// draws nothing.

export default defineCard({
  name: "Spell Contortion",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Multikicker {1}{U} (You may pay an additional {1}{U} any number of times as you cast this spell.)\nCounter target spell unless its controller pays {2}. Draw a card for each time Spell Contortion was kicked.",
  kicker: { cost: "{1}{U}", multi: true },
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "unless", chooser: 0, options: [{ pay: "{2}", text: "Pay {2}." }], otherwise: { kind: "counter", target: 0 } },
      { kind: "draw", amount: { timesKicked: "source" } },
    ],
  },
});
