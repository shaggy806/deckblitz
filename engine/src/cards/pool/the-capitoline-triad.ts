import { defineCard } from "../define.js";
import type { CardFilter } from "../../filter.js";

// EDHREC rank 7546.
//
// Historic: an artifact, a legendary or a Saga, each counted once (its
// ruling). The reduction counts the graveyard once the spell is on the stack
// (rule 601.2f; cast from the graveyard, it no longer counts itself), and its
// mana value stays 10. The ability's cost is any number of historic cards
// whose mana values total 30 or more ({X} in a graveyard is 0, rule 107.3g),
// chosen as it's paid (602.2b, as 601.2h); it isn't collecting evidence. The
// emblem sets base power and toughness (layer 7b, rule 613.4b) from its own
// timestamp: a later setter overrides it, counters and +N/+N still apply.
const HISTORIC: CardFilter = { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] };
const REDUCTION =
  "Those Who Came Before — This spell costs {1} less to cast for each historic card in your graveyard. (Artifacts, legendaries, and Sagas are historic.)";
const EMBLEM_TEXT = "Creatures you control have base power and toughness 9/9.";
const ABILITY = `Exile any number of historic cards from your graveyard with total mana value 30 or greater: You get an emblem with "${EMBLEM_TEXT}"`;

export default defineCard({
  name: "The Capitoline Triad",
  manaCost: "{10}",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God", "Artificer"],
  power: 7,
  toughness: 7,
  text: `${REDUCTION}\n${ABILITY}`,
  selfCostReduction: {
    // Unconditional: the always-true gate Blasphemous Act uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countInGraveyard: { ownedBy: "you", ...HISTORIC } },
  },
  activated: [
    {
      cost: { mana: null, tap: false, collectEvidence: { totalManaValue: 30, filter: HISTORIC } },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TEXT,
        static: {
          affects: { scope: "creatures-you-control" },
          setBasePt: { power: 9, toughness: 9 },
          text: EMBLEM_TEXT,
        },
      },
      resolve: null,
      text: ABILITY,
    },
  ],
});
