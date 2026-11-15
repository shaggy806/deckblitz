import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 21763.

const TEXT =
  "When Võx enters and at the beginning of your first main phase, the next artifact creature spell and the next Spacecraft spell you cast this turn have undaunted. (They cost {1} less to cast for each opponent.)";

// Two grants, each spent by the next spell of its kind; undaunted counts
// opponents as each spell is cast (rule 702.125a). A spell of both kinds is
// the next of each and has undaunted twice, each instance applying
// (702.125c) — the text read as written, no ruling published yet.
const GRANTS: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "grant-spells-this-turn", next: true, filter: { types: ["artifact", "creature"] }, undaunted: true },
    { kind: "grant-spells-this-turn", next: true, filter: { subtype: "Spacecraft" }, undaunted: true },
  ],
};

export default defineCard({
  name: "Võx, Child of the Collective",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: GRANTS, resolve: null, text: TEXT },
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: GRANTS,
      resolve: null,
      text: TEXT,
    },
  ],
});
