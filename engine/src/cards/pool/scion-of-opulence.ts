import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 10928.
//
// Rulings:
//   [2021-11-19] Playing a card this way follows all the normal timing rules for that card.
//
// Headless Rider's pair of dies triggers: itself, or another nontoken Vampire.

const DIES_TEXT = "Whenever this creature or another nontoken Vampire you control dies, create a Treasure token.";
const IMPULSE_TEXT = "{R}, Sacrifice two artifacts: Exile the top card of your library. You may play that card this turn.";
const TREASURE: EffectSpec = { kind: "create-token", token: "Treasure Token", count: 1 };

export default defineCard({
  name: "Scion of Opulence",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Noble"],
  power: 3,
  toughness: 1,
  text: `${DIES_TEXT} (It's an artifact with "{T}, Sacrifice this token: Add one mana of any color.")\n${IMPULSE_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: TREASURE,
      resolve: null,
      text: DIES_TEXT,
    },
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", subtype: "Vampire", token: false },
        otherOnly: true,
      },
      targets: [],
      effect: TREASURE,
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: { filter: { type: "artifact" }, count: 2 } },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: IMPULSE_TEXT,
    },
  ],
});
