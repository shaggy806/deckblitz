import { defineCard } from "../define.js";

// EDHREC rank 18016.
//
// "One or more cards are put into a library from anywhere": the
// `put-into-library` trigger event, `batched` — once per simultaneous move
// (`cards-put-into-library`), never for a scry or a shuffle.

export default defineCard({
  name: "Dutiful Knowledge Seeker",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Fox", "Spirit"],
  power: 2,
  toughness: 2,
  text:
    "Whenever one or more cards are put into a library from anywhere, put a +1/+1 counter on this creature.\n" +
    "{3}: Put target card from a graveyard on the bottom of its owner's library.",
  triggered: [
    {
      trigger: { on: "event", event: "put-into-library", batched: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever one or more cards are put into a library from anywhere, put a +1/+1 counter on this creature.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: "{3}: Put target card from a graveyard on the bottom of its owner's library.",
    },
  ],
});
