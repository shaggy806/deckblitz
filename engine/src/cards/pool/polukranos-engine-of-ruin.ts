import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Rulings:
//   [2023-04-14] If Polukranos, Engine of Ruin and other nontoken Hydras you control die at the
//     same time, Polukranos's triggered ability will trigger once for itself and once for each of
//     those other Hydras.
//
// "Polukranos or another nontoken Hydra" is two triggers (Headless Rider's
// shape): Polukranos itself counts even as a token copy, the others must be
// nontoken Hydras; one death fires one.

const TEXT =
  "Whenever Polukranos or another nontoken Hydra you control dies, create a 3/3 green and white Phyrexian Hydra creature token with reach and a 3/3 green and white Phyrexian Hydra creature token with lifelink.";

const HYDRAS: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "create-token", token: "Phyrexian Hydra Token (Reach)", count: 1 },
    { kind: "create-token", token: "Phyrexian Hydra Token (Lifelink)", count: 1 },
  ],
};

export default defineCard({
  name: "Polukranos, Engine of Ruin",
  art: "https://cards.scryfall.io/art_crop/back/4/7/47f7d313-8333-41fe-8bfa-c96774dac228.jpg",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Hydra"],
  power: 6,
  toughness: 6,
  keywords: ["reach", "lifelink"],
  text: `Reach, lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: HYDRAS,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", subtype: "Hydra", token: false },
        otherOnly: true,
      },
      targets: [],
      effect: HYDRAS,
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Polukranos Reborn", "Polukranos, Engine of Ruin"],
  transform: true,
});
