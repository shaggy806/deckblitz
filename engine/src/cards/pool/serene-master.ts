import { defineCard } from "../define.js";

// The exchange sets each power to the other's previous one (rule 701.12g),
// so bonuses still apply on top (the ruling), and happens only if both are
// still on the battlefield as it resolves.
export default defineCard({
  name: "Serene Master",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 0,
  toughness: 2,
  text: "Whenever this creature blocks, exchange its power and the power of target creature it's blocking until end of combat.",
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", blockingRelation: { relation: "blocked-by" } } }],
      effect: { kind: "exchange-stat", stat: "power", first: "source", second: 0, duration: "until-end-of-combat" },
      resolve: null,
      text: "Whenever this creature blocks, exchange its power and the power of target creature it's blocking until end of combat.",
    },
  ],
});
