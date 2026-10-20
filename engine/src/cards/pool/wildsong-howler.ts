import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// "Enters or transforms into" is two triggers (Ashling, Rekindled's shape): an
// enters trigger (it enters with this face up when it's night — rule
// 702.145f) and a transform into the back face.
const LOOK_TEXT =
  "Whenever this creature enters or transforms into Wildsong Howler, look at the top six cards of your library. You may reveal a creature card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

const LOOK: EffectSpec = {
  kind: "look-and-choose",
  zone: "library",
  count: 6,
  reveal: "chosen",
  min: 0,
  max: 1,
  filter: { type: "creature" },
  destination: "hand",
  leftover: "bottom-random",
};

export default defineCard({
  name: "Wildsong Howler",
  art: "https://cards.scryfall.io/art_crop/back/c/7/c7ceaf83-09c0-4492-a75d-4c47bd421858.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 4,
  toughness: 4,
  keywords: ["nightbound"],
  text: `${LOOK_TEXT}\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: LOOK,
      resolve: null,
      text: LOOK_TEXT,
    },
    {
      trigger: { on: "transforms", who: "self", intoFront: false },
      targets: [],
      effect: LOOK,
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
  faces: ["Howlpack Piper", "Wildsong Howler"],
  transform: true,
});
