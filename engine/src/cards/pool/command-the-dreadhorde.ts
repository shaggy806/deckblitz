import { defineCard } from "../define.js";

// EDHREC rank 6658. The damage comes first, read off the targets still legal
// (X in a graveyard card's cost is 0), then they all enter at once under you —
// before you'd lose for the damage (the ruling).
export default defineCard({
  name: "Command the Dreadhorde",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose any number of target creature and/or planeswalker cards in graveyards. Command the Dreadhorde deals damage to you equal to the total mana value of those cards. Put them onto the battlefield under your control.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", who: "you", amount: { aggregate: "sum", of: "mana-value", filter: {}, in: { targetsOf: "source" } } },
      {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      },
    ],
  },
});
