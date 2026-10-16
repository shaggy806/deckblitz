import { defineCard } from "../define.js";

// EDHREC rank 12797.
//
// Rulings:
//   [2024-04-12] You don't choose a target for Unscrupulous Contractor's ability at the time it
//     triggers. Rather, a second "reflexive" ability triggers if you sacrifice a creature this way.
//     You choose a target for that ability as it goes on the stack. Each player may respond to
//     this triggered ability as normal. Notably, the triggered ability isn't a crime, but the
//     reflexive triggered ability potentially is.
//
// Cavalier of Night's shape, but "a creature": it may be this one.

const ETB_TEXT =
  "When this creature enters, you may sacrifice a creature. When you do, target player draws two cards and loses 2 life.";

export default defineCard({
  name: "Unscrupulous Contractor",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 3,
  toughness: 2,
  plot: { cost: "{2}{B}" },
  text: `${ETB_TEXT}\nPlot {2}{B} (You may pay {2}{B} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, text: "Sacrifice a creature" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["player"],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "draw", amount: 2, target: 0 },
              { kind: "lose-life", amount: 2, target: 0 },
            ],
          },
          text: "When you do, target player draws two cards and loses 2 life.",
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
