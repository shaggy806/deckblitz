import { defineCard } from "../define.js";

const END_STEP =
  "At the beginning of each end step, if a player discarded a card this turn, create a 1/1 black Bird creature token with flying and \"This token can't block.\"";
const ACTIVATED = "{3}{B}, {T}: Each opponent discards a card. Activate only as a sorcery.";

export default defineCard({
  name: "The Raven Man",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  text: `${END_STEP}\n${ACTIVATED}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-history", what: "discarded", who: "any-player" },
      targets: [],
      effect: { kind: "create-token", token: "1/1 Black Bird Token (The Raven Man)", count: 1 },
      resolve: null,
      text: END_STEP,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{B}", tap: true },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "discard", target: "each-opponent", amount: 1 },
      resolve: null,
      text: ACTIVATED,
    },
  ],
});
