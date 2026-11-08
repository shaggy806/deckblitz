import { defineCard } from "../define.js";

// Star Trek Commander (TRC). Chapter I draws first, then shuffles the
// creature in; with no target chosen, nobody draws.

const I_TEXT =
  "I — The owner of up to one target creature draws two cards, then shuffles that creature into their library.";
const II_TEXT = "II — You may put a Spacecraft card from your hand or graveyard onto the battlefield.";
const III_TEXT = "III — You and target opponent each draw two cards.";

export default defineCard({
  name: "Unification",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2, who: { ownerOf: 0 } },
          { kind: "shuffle-into-library", target: 0 },
        ],
      },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a Spacecraft card from your hand or graveyard onto the battlefield?",
        effect: {
          kind: "return-from-graveyard",
          filter: { subtype: "Spacecraft" },
          destination: "battlefield",
          count: 1,
          from: "hand-or-graveyard",
        },
      },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "draw", amount: 2, target: 0 },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
