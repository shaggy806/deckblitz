import { defineCard } from "../define.js";

// EDHREC rank 27527. Nightsnare's optional choice, exiling; with no card in
// your own hand there's nothing for you to exile (the ruling).

export default defineCard({
  name: "Specter's Shriek",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You may choose a nonland card from it. If you do, that player exiles that card. If a nonblack card is exiled this way, exile a card from your hand.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "discard-chosen",
        target: 0,
        filter: { notTypes: ["land"] },
        optional: true,
        destination: "exile",
      },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "exiled", filter: { notColors: ["B"] }, atLeast: 1 },
        then: { kind: "look-and-choose", zone: "hand", min: 1, max: 1, destination: "exile", leftover: "stay" },
      },
    ],
  },
});
