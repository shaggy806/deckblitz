import { defineCard } from "../define.js";

// EDHREC rank 7697. The Zombies are counted after the new ones arrive, from
// the target player's side — every Zombie they control. Either target may be
// left out or go illegal and the other half still happens (the rulings); a
// player gone illegal tells the count nothing, so the -1/-1 doesn't happen
// (rule 608.2b — `forTarget` reads 0).
const ZOMBIES = { product: [{ countOf: { subtype: "Zombie", controlledBy: "you" }, forTarget: 0 }, -1] } as const;

export default defineCard({
  name: "Dark Salvation",
  manaCost: "{X}{X}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player creates X 2/2 black Zombie creature tokens, then up to one target creature gets -1/-1 until end of turn for each Zombie that player controls.",
  targets: ["player", { kind: "optional", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Zombie Token", count: "x", who: "target-controller" },
      { kind: "modify-pt", target: 1, power: ZOMBIES, toughness: ZOMBIES, duration: "end-of-turn" },
    ],
  },
});
