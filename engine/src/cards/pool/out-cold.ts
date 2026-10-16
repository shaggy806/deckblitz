import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// EDHREC rank 13820.
//
// Up to two targets (Homesickness's slots). With none chosen it still
// investigates; with targets chosen that are all illegal as it resolves, it
// doesn't resolve at all (rule 608.2b — the ruling). Ward's counter can't
// counter it.
const TEXT =
  "Tap up to two target creatures and put a stun counter on each of them. Investigate. (If a permanent with a stun counter would become untapped, remove one from it instead.)";

export default defineCard({
  name: "Out Cold",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  cantBeCountered: true,
  text: `This spell can't be countered. (This includes by the ward ability.)\n${TEXT}`,
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "tap", target: 1 },
      { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
      { kind: "add-counter", target: 1, counter: "stun", amount: 1 },
      investigate(),
    ],
  },
});
