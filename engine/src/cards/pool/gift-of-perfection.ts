import { defineCard } from "../define.js";
import { ASSIMILATE } from "../helpers.js";

// EDHREC rank 23682.

const TEXT =
  "Each opponent reveals cards from the top of their library until they reveal a creature card. Assimilate one of the creature cards revealed this way. Then each opponent puts the other cards they revealed this way on the bottom of their library in a random order. (To assimilate a card, put it onto the battlefield under your control with a +1/+1 counter. It's a Borg artifact creature and loses all other creature types.)";

// The revealed cards stay where they are (in their owners' libraries) until
// one creature card among them all is assimilated; then the rest, the other
// creature cards found too, go to the bottom, each owner's in a random order.
export default defineCard({
  name: "Gift of Perfection",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-player",
        who: "each-opponent",
        effect: { kind: "reveal-until", whose: "that-player", filter: { type: "creature" }, rest: "stay" },
      },
      {
        kind: "look-and-choose",
        zone: "revealed-this-way",
        min: 1,
        max: 1,
        filter: { type: "creature" },
        destination: "battlefield",
        under: "you",
        ...ASSIMILATE,
        leftover: "stay",
      },
      { kind: "move-exiled-this-way", to: "library-bottom", revealed: true },
    ],
  },
});
