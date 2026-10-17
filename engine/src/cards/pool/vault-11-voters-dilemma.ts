import { defineCard } from "../define.js";

// EDHREC rank 12205.
// Makes Human Soldier → "Human Soldier Token".
//
// A player may vote for no creature ("up to one"). The creatures tied for
// the most votes are destroyed together.

const I_TEXT = "I — For each opponent, you create a 1/1 white Human Soldier creature token.";
const II_TEXT =
  "II, III — Each player secretly votes for up to one creature, then those votes are revealed. If no creature got votes, each player draws a card. Otherwise, destroy each creature with the most votes or tied for most votes.";

export default defineCard({
  name: "Vault 11: Voter's Dilemma",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        simultaneous: true,
        effect: { kind: "create-token", token: "Human Soldier Token", count: 1 },
      },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2, 3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "vote", for: { permanent: { type: "creature" }, upToOne: true }, secret: true },
          {
            kind: "conditional",
            condition: { kind: "votes-cast" },
            then: { kind: "for-each-voted", which: "most", simultaneous: true, effect: { kind: "destroy", target: 0 } },
            else: { kind: "draw", amount: 1, who: "each-player" },
          },
        ],
      },
      resolve: null,
      text: II_TEXT,
    },
  ],
});
