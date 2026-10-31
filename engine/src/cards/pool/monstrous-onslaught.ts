import { defineCard } from "../define.js";

// Commander Legends (CMR). EDHREC rank 13472.
//
// X — the greatest power among creatures you control — is read as the spell
// is cast, when the division is announced (rule 601.2d); a pump or a removal
// in response changes nothing. At least 1 to each target, so no more targets
// than X; a target gone illegal loses its share (608.2b).
export default defineCard({
  name: "Monstrous Onslaught",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text:
    "Monstrous Onslaught deals X damage divided as you choose among any number of target creatures, where X is the greatest power among creatures you control as you cast this spell.",
  targets: [{ kind: "any-number", of: "creature" }],
  divided: {
    total: { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } },
    slot: 0,
  },
  effect: { kind: "damage-divided", from: 0 },
});
