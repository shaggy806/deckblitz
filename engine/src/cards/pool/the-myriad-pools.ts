import { defineCard } from "../define.js";

// The back face of The Everflowing Well.
//
// Rulings:
//   [2023-11-10] The target permanent copies what is printed on the original card, plus any
//     choices that were made when casting the spell.
//   [2023-11-10] Non-copy effects that have already applied to the target permanent will continue
//     to apply to it.
//   [2023-11-10] The triggered ability of The Myriad Pools will resolve before the spell that
//     caused it to trigger.
//   [2023-11-10] Because the target permanent isn't entering the battlefield when it becomes a
//     copy of a permanent spell, any "When [this permanent] enters" or "[This permanent] enters
//     with" abilities of the copied spell won't apply for the target permanent.
const COPY_TEXT =
  "Whenever you cast a permanent spell using mana produced by The Myriad Pools, up to one other target permanent you control becomes a copy of that spell until end of turn.";

export default defineCard({
  name: "The Myriad Pools",
  art: "https://cards.scryfall.io/art_crop/back/b/f/bf573fb7-fa6c-4df7-8e5e-1e071585361e.jpg",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "land"],
  text: `(Transforms from The Everflowing Well.)\n{T}: Add {U}.\n${COPY_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1 },
      resolve: null,
      text: "{T}: Add {U}.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
          manaSpent: [{ from: { fromSource: true } }],
        },
      },
      targets: [
        { kind: "optional", of: { kind: "other", of: { kind: "permanent", whose: "you", filter: {} }, than: "source" } },
      ],
      effect: { kind: "become-copy", target: 0, of: "trigger-object", until: "end-of-turn" },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
  faces: ["The Everflowing Well", "The Myriad Pools"],
  transform: true,
});
