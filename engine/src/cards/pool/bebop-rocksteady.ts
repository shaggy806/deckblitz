import { defineCard } from "../define.js";

// EDHREC rank 14308.
// "Attack or block" is two triggers (Daemogoth Titan). "Sacrifice a permanent
// unless you discard a card" is an `unless` you answer yourself (The Gitrog
// Monster's shape): with a card in hand you choose, with none you sacrifice —
// any permanent you control, Bebop & Rocksteady included.
const TEXT = "Whenever Bebop & Rocksteady attack or block, sacrifice a permanent unless you discard a card.";
const EFFECT = {
  kind: "unless",
  chooser: "you",
  options: [{ discard: 1, text: "Discard a card" }],
  otherwise: { kind: "sacrifice", who: "you", filter: {}, count: 1 },
} as const;

export default defineCard({
  name: "Bebop & Rocksteady",
  manaCost: "{1}{B/G}{B/G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Boar", "Rhino", "Mutant"],
  power: 7,
  toughness: 5,
  text: TEXT,
  triggered: [
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: EFFECT, resolve: null, text: TEXT },
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: EFFECT, resolve: null, text: TEXT },
  ],
});
