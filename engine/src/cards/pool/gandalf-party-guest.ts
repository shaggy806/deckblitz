import { defineCard } from "../define.js";

// EDHREC rank 15012. Its rulings: the spell is cast as this resolves or not at
// all, timing restrictions ignored.

const TEXT =
  "At the beginning of combat on your turn, you may cast an instant or sorcery spell with mana value X or less from your hand without paying its mana cost, where X is twice the number of legendary Wizards you control.";

export default defineCard({
  name: "Gandalf, Party Guest",
  manaCost: "{1}{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Wizard"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "cast-now",
        from: "hand",
        free: true,
        spell: {
          typesAnyOf: ["instant", "sorcery"],
          manaValue: {
            op: "lte",
            n: { amount: { product: [2, { countOf: { subtype: "Wizard", supertype: "legendary", controlledBy: "you" } }] } },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
