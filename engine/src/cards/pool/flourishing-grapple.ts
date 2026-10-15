import { defineCard } from "../define.js";

// EDHREC rank 28651.
// The red or white permanent loses its abilities first, then is bitten
// (Giantfall's one-sided fight, slots reversed): an illegal first target
// neither loses anything nor is dealt damage, and an illegal second target
// deals none (rule 608.2b).
export default defineCard({
  name: "Flourishing Grapple",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature or planeswalker an opponent controls that's red or white loses all abilities until end of turn. Target creature you control deals damage equal to its power to that permanent.",
  targets: [
    {
      kind: "permanent",
      whose: "opponent",
      filter: { typesAnyOf: ["creature", "planeswalker"], anyOf: [{ colors: ["R"] }, { colors: ["W"] }] },
    },
    "creature-you-control",
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-abilities", target: 0, duration: "end-of-turn" },
      { kind: "fight", a: 1, b: 0, oneSided: true },
    ],
  },
});
