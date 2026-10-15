import { defineCard } from "../define.js";

// EDHREC rank 21476.
//
// Up to three different target cards, returned together as one event (each
// sees the others enter). A target gone from the graveyard by resolution is
// illegal and simply isn't returned (rule 608.2b).
const HERO = { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", subtype: "Hero" } } as const;

export default defineCard({
  name: "Wondrous Revival",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Return up to three target Hero creature cards from your graveyard to the battlefield.",
  targets: [
    { kind: "optional", of: HERO },
    { kind: "optional", of: { kind: "other", of: HERO, than: { slots: [0] } } },
    { kind: "optional", of: { kind: "other", of: HERO, than: { slots: [0, 1] } } },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "put-onto-battlefield", target: 1 },
      { kind: "put-onto-battlefield", target: 2 },
    ],
  },
});
