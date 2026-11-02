import { defineCard } from "../define.js";

// The grant is read of each planeswalker, so "this planeswalker" is that one: one
// attacker per planeswalker at the declaration, and a creature put onto the
// battlefield attacking one, or moved to it, is past the limit (the ruling).
const GRANT = "No more than one creature can attack this planeswalker each combat.";
const GRANT_LINE = `Planeswalkers you control have "${GRANT}"`;
const FLYING_LINE = "{T}: Target creature with a +1/+1 counter on it gains flying until end of turn.";

export default defineCard({
  name: "Tomik, Orzhov Lawmage",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${GRANT_LINE}\n${FLYING_LINE}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "planeswalker", controlledBy: "you" } },
      grantsStatic: [{ affects: { scope: "self" }, attackLimit: { most: 1, covers: "self" }, text: GRANT }],
      text: GRANT_LINE,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [
        { kind: "permanent", filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } } },
      ],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: FLYING_LINE,
    },
  ],
});
