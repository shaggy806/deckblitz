import { defineCard } from "../define.js";

// EDHREC rank 16536. The Brothers' War.
// Rulings:
//   You cast the copy while the ability is resolving and still on the stack. You can't wait to
//   cast it later in the turn.
//   If you don't want to cast the copy, you can choose not to; the copy ceases to exist the next
//   time state-based actions are checked.
//   If another effect causes Arcane Proxy's power to be less than the mana value of the target
//   card as the ability tries to resolve, the target is illegal. The card won't be exiled, and
//   you won't get to cast a copy.

const ENTER_TEXT =
  "When this creature enters, if you cast it, exile target instant or sorcery card with mana value less than or equal to this creature's power from your graveyard. Copy that card. You may cast the copy without paying its mana cost.";

export default defineCard({
  name: "Arcane Proxy",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Wizard"],
  power: 4,
  toughness: 3,
  text:
    "Prototype {1}{U}{U} — 2/1 (You may cast this spell with different mana cost, color, and size. " +
    "It keeps its abilities and types.)\n" +
    ENTER_TEXT,
  prototype: { cost: "{1}{U}{U}", power: 2, toughness: 1 },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      // Narset, Enlightened Exile's shape; the power is read live, so the
      // target is rechecked against it as the ability resolves.
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            typesAnyOf: ["instant", "sorcery"],
            manaValue: { op: "lte", n: { amount: { powerOf: "source" } } },
          },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "cast-now", from: "exiled-this-way", copies: 1, free: true },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
