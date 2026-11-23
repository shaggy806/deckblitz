import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). "Devotion to Abzan" is devotion to white,
// black and green together (rule 700.5): each {W}, {B} or {G} symbol counts,
// a hybrid one once. It comes off the {5} alone.

const TEXT =
  "{5}, {T}: You draw a card and lose 1 life. This ability costs X less to activate, where X is your devotion to Abzan.";

export default defineCard({
  name: "Devoted Abzan",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dog", "Cleric"],
  power: 1,
  toughness: 1,
  text: "{5}, {T}: You draw a card and lose 1 life. This ability costs X less to activate, where X is your devotion to Abzan. (Each {W}, {B}, or {G} in the mana cost of permanents you control counts towards your devotion to Abzan.)",
  activated: [
    {
      cost: { mana: "{5}", tap: true },
      costReduction: { reduceGeneric: { devotionTo: ["W", "B", "G"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
