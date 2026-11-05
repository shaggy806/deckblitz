import { defineCard } from "../define.js";

// The +1's keyword counter is chosen as it resolves (the ruling); with no
// target chosen there's nothing to choose. The −3's permanent enters with
// its shield counter (`withCounters`).

const PLUS_TEXT =
  "+1: Choose up to one target creature. Put a +1/+1 counter and a counter from among flying, first strike, lifelink, or vigilance on it.";
const MINUS_THREE_TEXT =
  "−3: Look at the top seven cards of your library. You may put a permanent card with mana value 3 or less from among them onto the battlefield with a shield counter on it. Put the rest on the bottom of your library in a random order.";
const MINUS_SEVEN_TEXT = "−7: Create five 3/3 white Angel creature tokens with flying.";
const PERMANENT_TYPES = ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] as const;
const COUNTER_MODES = (["flying", "first-strike", "lifelink", "vigilance"] as const).map((counter) => ({
  text: `A +1/+1 counter and a ${counter.replace("-", " ")} counter`,
  effect: {
    kind: "sequence" as const,
    effects: [
      { kind: "add-counter" as const, target: 0, counter: "+1/+1", amount: 1 },
      { kind: "add-counter" as const, target: 0, counter, amount: 1 },
    ],
  },
}));

export default defineCard({
  name: "Elspeth Resplendent",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Elspeth"],
  loyalty: 5,
  text: `${PLUS_TEXT}\n${MINUS_THREE_TEXT}\n${MINUS_SEVEN_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "conditional",
        condition: { kind: "target-chosen", index: 0 },
        then: { kind: "modal", minModes: 1, maxModes: 1, modes: COUNTER_MODES },
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 7,
        min: 0,
        max: 1,
        filter: { typesAnyOf: [...PERMANENT_TYPES], manaValue: { op: "lte", n: 3 } },
        destination: "battlefield",
        withCounters: { kind: "shield", amount: 1 },
        leftover: "bottom-random",
      },
      resolve: null,
      text: MINUS_THREE_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "3/3 White Angel Token", count: 5 },
      resolve: null,
      text: MINUS_SEVEN_TEXT,
    },
  ],
});
