import { defineCard } from "../define.js";

// Marvel Super Heroes (MSH). EDHREC rank 15896.
//
// A Plan (Claim the Kingdom's fourth-counter trigger and reflexive "when you
// do"). The reflexive ability is put on the stack once the sacrifice is done
// (rule 603.12), and its one or two targets and the split of the 7 are
// announced then (603.3d, 601.2d), at least 1 to each; a target gone illegal
// loses its share (608.2b). "It" is the sacrificed enchantment, as it last
// existed on the battlefield (608.2h).

const CAST_TEXT =
  "Whenever you cast a noncreature spell, create a tapped Treasure token and put a plan counter on this enchantment.";
const PLAN_TEXT =
  "When the fourth plan counter is put on this enchantment, sacrifice it. When you do, it deals 7 damage divided as you choose among one or two targets.";

export default defineCard({
  name: "Death to Our Enemies",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Plan"],
  text: `${CAST_TEXT}\n${PLAN_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Treasure Token", count: 1, tapped: true },
          { kind: "add-counter", target: "source", counter: "plan", amount: 1 },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "counters-put", who: "self", counter: "plan", nth: 4 },
      targets: [],
      effect: {
        kind: "sacrifice-source",
        then: {
          kind: "reflexive-trigger",
          targets: [{ kind: "any-number", of: "any-target", min: 1, max: 2 }],
          divided: { total: 7, slot: 0 },
          effect: { kind: "damage-divided", from: 0 },
          text: "It deals 7 damage divided as you choose among one or two targets.",
        },
      },
      resolve: null,
      text: PLAN_TEXT,
    },
  ],
});
