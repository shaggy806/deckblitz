import { defineCard } from "../define.js";

// Rulings: the token's as-enters abilities work (an Aura token is asked what
// it enchants, rule 303.4f); something copying the token isn't legendary
// either.

const TEXT =
  "{2}, {T}: Choose target enchantment you control that doesn't have the same name as another permanent you control. Create a token that's a copy of it, except it isn't legendary. If the token is an Aura, untap Yenna, then scry 2. Activate only as a sorcery.";

export default defineCard({
  name: "Yenna, Redtooth Regent",
  manaCost: "{2}{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Noble"],
  power: 4,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      sorcerySpeed: true,
      targets: [
        {
          kind: "permanent",
          whose: "you",
          filter: { type: "enchantment", not: { sameNameAsAnother: { controlledBy: "you" } } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token-copy", of: 0, count: 1, who: "you", exceptions: { removeSupertypes: ["legendary"] } },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "created", filter: { subtype: "Aura" } },
            then: {
              kind: "sequence",
              effects: [
                { kind: "untap", target: "source" },
                { kind: "scry", amount: 2 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
