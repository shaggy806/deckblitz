import { defineCard } from "../define.js";

// EDHREC rank 13606. X is read as the spell is cast, when the division is
// announced (rule 601.2d — its ruling), and won't change. It's the most one
// source has dealt to one permanent or player this turn, whoever controlled
// it (`damageDealtThisTurn` with `oneSource` and `oneRecipient`, over every
// player's sources): Earthquake's 5 to each of six things is 5 (the ruling).
// Each object in each stint is its own source and its own recipient (rule
// 400.7). At least 1 to each target, so no more targets than X; a target gone
// illegal loses its share (608.2b).
export default defineCard({
  name: "Impact Resonance",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text:
    "Impact Resonance deals X damage divided as you choose among any number of target creatures, where X is the greatest amount of damage dealt by a source to a permanent or player this turn.",
  targets: [{ kind: "any-number", of: "creature" }],
  divided: {
    total: { damageDealtThisTurn: true, who: "each-player", oneSource: true, oneRecipient: true },
    slot: 0,
  },
  effect: { kind: "damage-divided", from: 0 },
});
