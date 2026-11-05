import { defineCard } from "../define.js";

// EDHREC rank 19734. Exiled face up and for good, whatever becomes of Kyoki (the
// rulings), so not linked to it.
const TEXT = "Whenever you cast a Spirit or Arcane spell, target opponent exiles a card from their hand.";

export default defineCard({
  name: "Kyoki, Sanity's Eclipse",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon", "Spirit"],
  power: 6,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: ["opponent"],
      effect: {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "hand",
          min: 1,
          max: 1,
          destination: "exile",
          unlinked: true,
          leftover: "stay",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
