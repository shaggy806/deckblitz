import { defineCard } from "../define.js";

// The aftermath half of Appeal // Authority: cast only from a graveyard, then exiled
// (rule 702.127a).
const FACES = ["Appeal // Authority", "Appeal", "Authority"];

export default defineCard({
  name: "Authority",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nTap up to two target creatures your opponents control. Creatures you control gain vigilance until end of turn.",
  // With no targets chosen it still resolves and gives vigilance; with
  // targets that all became illegal it doesn't resolve at all (the ruling).
  targets: [
    { kind: "optional", of: "creature-an-opponent-controls" },
    { kind: "optional", of: { kind: "other", of: "creature-an-opponent-controls", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "tap", target: 1 },
      { kind: "grant-keyword-all", filter: { type: "creature", controlledBy: "you" }, keyword: "vigilance", duration: "end-of-turn" },
    ],
  },
  faces: FACES,
  split: true,
  aftermath: true,
});
