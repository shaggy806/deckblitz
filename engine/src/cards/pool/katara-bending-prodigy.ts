import { defineCard } from "../define.js";

// EDHREC rank 6171.
//
// "If Katara is tapped" is an intervening-if (rule 603.4), checked as the
// end step begins and again as it resolves — Mana Vault's shape. Katara may
// tap herself to help pay her own waterbend cost (she has no {T} in it), and
// so set up her end-step counter.

const END_TEXT = "At the beginning of your end step, if Katara is tapped, put a +1/+1 counter on her.";
const BEND_TEXT = "Waterbend {6}: Draw a card.";

export default defineCard({
  name: "Katara, Bending Prodigy",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Ally"],
  power: 2,
  toughness: 3,
  text: `${END_TEXT}\n${BEND_TEXT} (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "source", filter: { tapped: true } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{6}", tap: false, waterbend: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: BEND_TEXT,
    },
  ],
});
