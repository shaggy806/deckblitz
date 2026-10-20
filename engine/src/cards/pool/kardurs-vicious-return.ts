import { defineCard } from "../define.js";

// EDHREC rank 18578. Kaldheim.
//
// I: the chapter has no target; the sacrifice is chosen as it resolves, and the
// reflexive trigger then targets (Shrapnel Slinger's shape). III: the creature
// enters, then gets its counter (not "enters with"), then haste until your
// next turn.

const I_TEXT = "I — You may sacrifice a creature. When you do, this Saga deals 3 damage to any target.";
const II_TEXT = "II — Each player discards a card.";
const III_TEXT =
  "III — Return target creature card from your graveyard to the battlefield. Put a +1/+1 counter on it. It gains haste until your next turn.";

export default defineCard({
  name: "Kardur's Vicious Return",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, text: "Sacrifice a creature" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["any-target"],
          effect: { kind: "damage", amount: 3, target: 0 },
          text: "When you do, this Saga deals 3 damage to any target.",
        },
      },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "discard", target: "each-player", amount: 1 },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: 0 },
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "until-your-next-turn" },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
