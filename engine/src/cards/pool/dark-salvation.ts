import { defineCard } from "../define.js";

// EDHREC rank 7697.
// Makes Zombie → "Zombie Token".
//
// The Zombies are counted as the -1/-1 applies, after the tokens are made,
// from the targeted player's side (`forTarget`) — every Zombie they control,
// not only the new ones. The creature slot is optional (the rulings), and an
// illegal creature target still leaves the player their tokens.

const TEXT =
  "Target player creates X 2/2 black Zombie creature tokens, then up to one target creature gets -1/-1 until end of turn for each Zombie that player controls.";
const MINUS = { product: [-1, { countOf: { subtype: "Zombie", controlledBy: "you" }, forTarget: 0 }] } as const;

export default defineCard({
  name: "Dark Salvation",
  manaCost: "{X}{X}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["player", { kind: "optional", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Zombie Token", count: "x", who: "target-controller" },
      { kind: "modify-pt", target: 1, power: MINUS, toughness: MINUS, duration: "end-of-turn" },
    ],
  },
});
