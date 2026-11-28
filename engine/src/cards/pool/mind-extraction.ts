import { defineCard } from "../define.js";

// EDHREC rank 28705. Bone Splinters' additional cost, and Persecute's
// `discard-hand` with a filter of every card sharing a color with the
// sacrificed creature (`sharesColorWith: { paid: "sacrificed" }`, its colors
// as it last existed, rule 608.2h). Its rulings: a colorless creature
// reveals the hand and discards nothing; a multicolored one discards each
// card sharing any of its colors.

export default defineCard({
  name: "Mind Extraction",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice a creature.\nTarget player reveals their hand and discards all cards of each of the sacrificed creature's colors.",
  additionalCost: { sacrifice: { type: "creature" } },
  targets: ["player"],
  effect: { kind: "discard-hand", who: 0, filter: { sharesColorWith: { paid: "sacrificed" } }, reveal: true },
});
