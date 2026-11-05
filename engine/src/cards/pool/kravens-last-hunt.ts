import { defineCard } from "../define.js";

// EDHREC rank 15206. "When you do" triggers only if all five were milled; the
// damage is read as the reflexive ability resolves.

const ONE =
  "I — Mill five cards. When you do, this Saga deals damage equal to the greatest power among creature cards in your graveyard to target creature.";
const TWO = "II — Target creature you control gets +2/+2 until end of turn.";
const THREE = "III — Return target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Kraven's Last Hunt",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${ONE}\n${TWO}\n${THREE}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 5 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "milled", atLeast: 5 },
            then: {
              kind: "reflexive-trigger",
              targets: ["creature"],
              effect: {
                kind: "damage",
                target: 0,
                amount: { aggregate: "max", of: "power", filter: { type: "creature", ownedBy: "you" }, in: "graveyards" },
              },
              text: "This Saga deals damage equal to the greatest power among creature cards in your graveyard to target creature.",
            },
          },
        ],
      },
      resolve: null,
      text: ONE,
    },
    {
      at: [2],
      targets: ["creature-you-control"],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: TWO,
    },
    {
      at: [3],
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: THREE,
    },
  ],
});
