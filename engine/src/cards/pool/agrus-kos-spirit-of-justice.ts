import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 12139.
//
// One printed ability with two trigger events, so two entries. The target is
// optional ("up to one"); as the ability resolves it's exiled if it's
// suspected then, and suspected otherwise (rule 701.60 — a creature already
// suspected can't become so again, and suspecting is no copiable value).
const TEXT =
  "Whenever Agrus Kos enters or attacks, choose up to one target creature. If it's suspected, exile it. Otherwise, suspect it. (A suspected creature has menace and can't block.)";

const EFFECT: EffectSpec = {
  kind: "conditional",
  condition: { kind: "target", index: 0, filter: { suspected: true } },
  then: { kind: "exile", target: 0 },
  else: { kind: "suspect", target: 0 },
};

export default defineCard({
  name: "Agrus Kos, Spirit of Justice",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Detective"],
  power: 2,
  toughness: 4,
  keywords: ["double-strike", "vigilance"],
  text: `Double strike, vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
  ],
});
