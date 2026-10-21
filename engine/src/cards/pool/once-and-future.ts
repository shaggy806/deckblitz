import { defineCard } from "../define.js";

// Which card goes where is fixed by its target slot (the rulings); adamant
// replaces the library half with a second return to hand. "Exile Once and
// Future" is `exileOnResolve`, so a spell whose targets are all gone goes to
// the graveyard (the ruling).
const CARD_IN_YOUR_GRAVEYARD = { kind: "card-in-graveyard", whose: "you" } as const;

export default defineCard({
  name: "Once and Future",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Return target card from your graveyard to your hand. Put up to one other target card from your graveyard on top of your library. Exile Once and Future.\nAdamant — If at least three green mana was spent to cast this spell, instead return those cards to your hand and exile Once and Future.",
  targets: [
    CARD_IN_YOUR_GRAVEYARD,
    { kind: "optional", of: { kind: "other", of: CARD_IN_YOUR_GRAVEYARD, than: { slots: [0] } } },
  ],
  exileOnResolve: true,
  effect: {
    kind: "conditional",
    condition: { kind: "source", filter: { manaSpentOfColors: { G: 3 } } },
    then: {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "return-to-hand", target: 0, from: "graveyard" },
        { kind: "return-to-hand", target: 1, from: "graveyard" },
      ],
    },
    else: {
      kind: "sequence",
      effects: [
        { kind: "return-to-hand", target: 0, from: "graveyard" },
        { kind: "put-on-library", target: 1, position: "top" },
      ],
    },
  },
});
