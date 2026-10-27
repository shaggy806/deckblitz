import { defineCard } from "../define.js";

// Fable of the Mirror-Breaker's back face. Kiki-Jiki, Mirror Breaker's token
// copy, with "another target nonlegendary creature you control".

const TEXT =
  "{1}, {T}: Create a token that's a copy of another target nonlegendary creature you control, except it has haste. Sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "Reflection of Kiki-Jiki",
  art: "https://cards.scryfall.io/art_crop/back/2/4/24c0d87b-0049-4beb-b9cb-6f813b7aa7dc.jpg",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [
        {
          kind: "other",
          of: { kind: "permanent", whose: "you", filter: { type: "creature", notSupertype: "legendary" } },
        },
      ],
      effect: { kind: "create-token-copy", of: 0, count: 1, gainsHaste: true, sacrificeAtEndStep: true },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Fable of the Mirror-Breaker", "Reflection of Kiki-Jiki"],
  transform: true,
});
