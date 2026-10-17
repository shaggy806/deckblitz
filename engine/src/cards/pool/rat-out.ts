import { defineCard } from "../define.js";

// EDHREC rank 10300. Wilds of Eldraine. Cast with no target it just makes the
// Rat; cast with one that's illegal as it resolves, it does nothing at all
// (its ruling — rule 608.2b).
const TEXT =
  'Up to one target creature gets -1/-1 until end of turn. You create a 1/1 black Rat creature token with "This token can\'t block."';

export default defineCard({
  name: "Rat Out",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "optional", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      { kind: "create-token", token: "Rat Token (Can't Block)", count: 1 },
    ],
  },
});
