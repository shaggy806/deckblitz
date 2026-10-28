import { defineCard } from "../define.js";

// A modal double-faced card (sorcery // land): its back face, Agadeem, the
// Undercrypt, is a land you play instead. The targets' mana values must all
// differ (`differentManaValues`), each X or less, checked as they're chosen
// and again as it resolves.
const TEXT =
  "Return from your graveyard to the battlefield any number of target creature cards that each have a different mana value X or less.";

export default defineCard({
  name: "Agadeem's Awakening",
  manaCost: "{X}{B}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: [
    {
      kind: "any-number",
      of: {
        kind: "card-in-graveyard",
        whose: "you",
        filter: { type: "creature", manaValue: { op: "lte", n: "x" } },
      },
      differentManaValues: true,
    },
  ],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "put-onto-battlefield", target: 0 },
  },
  faces: ["Agadeem's Awakening", "Agadeem, the Undercrypt"],
});
