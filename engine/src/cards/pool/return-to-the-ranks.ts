import { defineCard } from "../define.js";

// Magic 2015. EDHREC rank 10848.
//
// X target slots (`any-number` with min and max X), every target returned as one
// event (`simultaneous`). Convoke pays the total cost after X is chosen (the ruling).
export default defineCard({
  name: "Return to the Ranks",
  manaCost: "{X}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nReturn X target creature cards with mana value 2 or less from your graveyard to the battlefield.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 2 } } },
      min: "x",
      max: "x",
    },
  ],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "put-onto-battlefield", target: 0 },
  },
});
