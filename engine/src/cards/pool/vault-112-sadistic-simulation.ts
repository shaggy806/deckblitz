import { defineCard } from "../define.js";

// EDHREC rank 11549.
const STUN_TEXT =
  "I, II — Tap up to one target creature and put a stun counter on it. You get {E}{E} (two energy counters).";
const SIMULATION_TEXT =
  "III — Pay any amount of {E}. If you paid one or more {E} this way, shuffle your library, then exile that many cards from the top. You may play one of those cards without paying its mana cost.";

export default defineCard({
  name: "Vault 112: Sadistic Simulation",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${STUN_TEXT}\n${SIMULATION_TEXT}`,
  chapters: [
    {
      at: [1, 2],
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
          { kind: "get-energy", amount: 2 },
        ],
      },
      resolve: null,
      text: STUN_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay any amount of {E} to shuffle, exile that many cards from the top and play one for free?",
        costEnergyX: "one-or-more",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "shuffle-library" },
            { kind: "exile-from-library", amount: "x" },
            { kind: "cast-now", from: "exiled-this-way", free: true, play: true },
          ],
        },
      },
      resolve: null,
      text: SIMULATION_TEXT,
    },
  ],
});
