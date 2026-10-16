import { defineCard } from "../define.js";

// EDHREC rank 7889. Bloomburrow.
//
// X is counted as the trigger resolves, this creature included, and doesn't
// change later in the turn (the ruling) — Frontline Rush's pump, read once.
const TEXT =
  "When this creature enters, until end of turn, target creature you control gains vigilance and gets +X/+X, where X is the number of creatures you control.";

const X = { countOf: { type: "creature", controlledBy: "you" } } as const;

export default defineCard({
  name: "Treeguard Duo",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Frog", "Rabbit"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
          { kind: "modify-pt", target: 0, power: X, toughness: X, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
