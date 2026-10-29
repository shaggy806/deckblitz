import { defineCard } from "../define.js";

const KEIMI_TEXT =
  "Whenever you cast an enchantment spell, if you don't control a creature named Keimi, create Keimi, a legendary 3/3 black and green Frog creature token with \"Whenever you cast an enchantment spell, each opponent loses 1 life and you gain 1 life.\"";
const EVADE_TEXT =
  "{1}{G/U}: Tatsunari and target Frog you control can't be blocked this turn except by creatures with flying or reach.";
// "Except by creatures with flying or reach": none without either.
const NO_FLYING_OR_REACH = { not: { anyOf: [{ keyword: "flying" }, { keyword: "reach" }] } } as const;

// The Keimi check is an intervening if (603.4), asked again as it resolves.
// The evasion is a rule on each creature for this turn, not an ability.
export default defineCard({
  name: "Tatsunari, Toad Rider",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Ninja"],
  power: 3,
  toughness: 3,
  text: `${KEIMI_TEXT}\n${EVADE_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "enchantment" } },
      condition: { kind: "not", of: { kind: "controls", filter: { type: "creature", name: "Keimi" }, atLeast: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Keimi", count: 1 },
      resolve: null,
      text: KEIMI_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{G/U}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Frog" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "restrict", target: "source", restrictions: [], cantBeBlockedBy: NO_FLYING_OR_REACH },
          { kind: "restrict", target: 0, restrictions: [], cantBeBlockedBy: NO_FLYING_OR_REACH },
        ],
      },
      resolve: null,
      text: EVADE_TEXT,
    },
  ],
});
