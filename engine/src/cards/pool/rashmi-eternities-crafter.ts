import { defineCard } from "../define.js";

// Ziatora's Envoy's shape with a reveal: the top card is offered free if it's
// a spell of lesser mana value than the triggering spell (as it last existed
// on the stack, if it was countered — the ruling); otherwise — declined, a
// land, or too big — that same top card goes to your hand.
const TEXT =
  "Whenever you cast your first spell each turn, reveal the top card of your library. You may cast it without paying its mana cost if it's a spell with lesser mana value. If you don't cast it, put it into your hand.";

export default defineCard({
  name: "Rashmi, Eternities Crafter",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", firstEachTurn: true },
      targets: [],
      effect: {
        kind: "cast-now",
        from: { libraryTop: 1, reveal: true },
        free: true,
        spell: { manaValue: { op: "lt", n: { amount: { manaValueOf: "trigger-object" } } } },
        else: {
          kind: "look-and-choose",
          zone: "library",
          count: 1,
          min: 1,
          max: 1,
          destination: "hand",
          leftover: "stay",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
