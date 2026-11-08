import { defineCard } from "../define.js";

// Ruling: transforming doesn't make her leave the battlefield, so the card
// stays playable after she transforms.

const ETB_TEXT =
  "When Gwen Stacy enters, exile the top card of your library. You may play that card for as long as you control this creature.";
const TRANSFORM_TEXT = "{2}{U}{R}{W}: Transform Gwen Stacy. Activate only as a sorcery.";

export default defineCard({
  name: "Gwen Stacy",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Performer", "Hero"],
  power: 2,
  toughness: 1,
  text: `${ETB_TEXT}\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "while-you-control-source", play: true },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{U}{R}{W}", tap: false },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  // A modal DFC whose front can transform into its back (Bruce Banner's shape).
  faces: ["Gwen Stacy", "Ghost-Spider"],
});
