import { defineCard } from "../define.js";

// EDHREC rank 26075.
// "If it's a creature" is read as the spell resolves.

export default defineCard({
  name: "Shields Up!",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target artifact or creature you control gains hexproof and indestructible until end of turn. If it's a creature, put a +1/+1 counter on it. (It can't be the target of spells or abilities your opponents control. Damage and effects that say \"destroy\" don't destroy it.)",
  targets: [{ kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { type: "creature" } },
        then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
    ],
  },
});
