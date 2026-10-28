import { defineCard } from "../define.js";

// Each counter goes on one of the creatures returned this way, the caster's
// choice — both on one, or one each (the rulings); none returned, no counters.
export default defineCard({
  name: "Call of the Death-Dweller",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return up to two target creature cards with total mana value 3 or less from your graveyard to the battlefield. Put a deathtouch counter on either of them. Then put a menace counter on either of them.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
      max: 2,
      maxTotalManaValue: 3,
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
      {
        kind: "choose-permanents",
        filter: { thisWay: "put-onto-battlefield" },
        min: 1,
        upTo: 1,
        then: { kind: "add-counter", target: 0, counter: "deathtouch", amount: 1 },
        prompt: "Put a deathtouch counter on one of them",
      },
      {
        kind: "choose-permanents",
        filter: { thisWay: "put-onto-battlefield" },
        min: 1,
        upTo: 1,
        then: { kind: "add-counter", target: 0, counter: "menace", amount: 1 },
        prompt: "Put a menace counter on one of them",
      },
    ],
  },
});
