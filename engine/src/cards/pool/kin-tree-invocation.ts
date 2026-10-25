import { defineCard } from "../define.js";

// EDHREC rank 19723.
//
// X is read once, as it resolves (the ruling); with no creatures it's 0 and
// the 0/0 token dies at once.

const GREATEST_TOUGHNESS = {
  aggregate: "max",
  of: "toughness",
  filter: { type: "creature", controlledBy: "you" },
} as const;

export default defineCard({
  name: "Kin-Tree Invocation",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "Create an X/X black and green Spirit Warrior creature token, where X is the greatest toughness among creatures you control.",
  targets: [],
  effect: {
    kind: "create-token",
    token: "Spirit Warrior Token",
    count: 1,
    basePt: { power: GREATEST_TOUGHNESS, toughness: GREATEST_TOUGHNESS },
  },
});
