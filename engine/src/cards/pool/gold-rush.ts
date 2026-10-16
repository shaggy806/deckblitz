import { defineCard } from "../define.js";

// EDHREC rank 9740.
//
// The Treasures are counted as it resolves, after the new one is made, and
// the bonus is locked in then (the ruling). The target is optional; one
// chosen that has become illegal stops the whole spell, Treasure and all
// (rule 608.2b, the ruling).
const TEXT =
  "Create a Treasure token. Until end of turn, up to one target creature gets +2/+2 for each Treasure you control.";
const PER_TREASURE = { countOf: { subtype: "Treasure", controlledBy: "you" }, times: 2 } as const;

export default defineCard({
  name: "Gold Rush",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "optional", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Treasure Token", count: 1 },
      { kind: "modify-pt", target: 0, power: PER_TREASURE, toughness: PER_TREASURE, duration: "end-of-turn" },
    ],
  },
});
