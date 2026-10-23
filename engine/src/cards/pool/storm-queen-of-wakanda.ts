import { defineCard } from "../define.js";

// EDHREC rank 15161.

export default defineCard({
  name: "Storm, Queen of Wakanda",
  manaCost: "{3}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Noble", "Hero"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhenever Storm attacks, until end of turn, another target attacking creature gains flying and gets +X/+0, where X is Storm's power.\nWhenever a creature with flying attacks you, Storm deals damage equal to her power to that creature.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", attacking: true } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
          { kind: "modify-pt", target: 0, power: { powerOf: "source" }, toughness: 0, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Whenever Storm attacks, until end of turn, another target attacking creature gains flying and gets +X/+0, where X is Storm's power.",
    },
    {
      trigger: { on: "attacks", who: "any", filter: { keyword: "flying" }, attackingYou: true, defender: "player" },
      targets: [],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: "trigger-object" },
      resolve: null,
      text: "Whenever a creature with flying attacks you, Storm deals damage equal to her power to that creature.",
    },
  ],
});
