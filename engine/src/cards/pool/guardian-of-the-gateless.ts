import { defineCard } from "../define.js";

// Conspiracy: Take the Crown (CN2). EDHREC rank 13164.
//
// One trigger however many it blocks (rule 509.3a), the attackers counted as
// it resolves: `blockingRelation`'s "blocked-by", bound to this creature.
const BLOCK_ANY_TEXT = "This creature can block any number of creatures.";
const TEXT = "Whenever this creature blocks, it gets +1/+1 until end of turn for each creature it's blocking.";
const BLOCKED = { countOf: { type: "creature", blockingRelation: { relation: "blocked-by" } } } as const;

export default defineCard({
  name: "Guardian of the Gateless",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${BLOCK_ANY_TEXT}\n${TEXT}`,
  static: [{ affects: { scope: "self" }, blockAdditional: "any", text: BLOCK_ANY_TEXT }],
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: BLOCKED, toughness: BLOCKED, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
