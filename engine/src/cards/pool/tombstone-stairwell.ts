import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// The Tombspawn are created with this enchantment (whoever creates them), so
// the end-step and leave triggers — one ability with two events — find them.
const CUMULATIVE =
  "Cumulative upkeep {1}{B} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";
const UPKEEP =
  "At the beginning of each upkeep, if this enchantment is on the battlefield, each player creates a 2/2 black Zombie creature token with haste named Tombspawn for each creature card in their graveyard.";
const DESTROY =
  "At the beginning of each end step and when this enchantment leaves the battlefield, destroy all tokens created with this enchantment. They can't be regenerated.";
const DESTROY_EFFECT = {
  kind: "destroy-all",
  filter: { token: true, createdWithSource: true },
  cantBeRegenerated: true,
} as const;

export default defineCard({
  name: "Tombstone Stairwell",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: `${CUMULATIVE}\n${UPKEEP}\n${DESTROY}`,
  triggered: [
    cumulativeUpkeep("{1}{B}"),
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      condition: { kind: "source-zone", zones: ["battlefield"], sameObject: true },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-player",
        effect: {
          kind: "create-token",
          token: "Tombspawn",
          count: { countInGraveyard: { type: "creature", ownedBy: "you" }, forEachPlayer: true },
          who: "that-player",
          linkedToSource: true,
        },
      },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: DESTROY_EFFECT,
      resolve: null,
      text: DESTROY,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      sameAbilityAs: 2,
      targets: [],
      effect: DESTROY_EFFECT,
      resolve: null,
      text: DESTROY,
    },
  ],
});
