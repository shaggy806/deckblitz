import { defineCard } from "../define.js";

// Back face of Ratchet, Field Medic. "Put into a graveyard from the
// battlefield" is a batched leave (Seer of Stolen Sight's shape): one trigger
// for any number of nontoken artifacts at once, and only the first such event
// each turn (`oncePerTurn`).

const DIES_TEXT =
  "Whenever one or more nontoken artifacts you control are put into a graveyard from the battlefield, convert Ratchet. This ability triggers only once each turn.";

export default defineCard({
  name: "Ratchet, Rescue Racer",
  art: "https://cards.scryfall.io/art_crop/back/c/2/c23a2d6b-43c2-4756-94c7-207cc344f0a7.jpg",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 1,
  toughness: 4,
  keywords: ["lifelink"],
  text: `Living metal (During your turn, this Vehicle is also a creature.)\nLifelink\n${DIES_TEXT}`,
  static: [{ affects: { scope: "self" }, condition: { kind: "your-turn" }, addTypes: ["creature"], text: "Living metal" }],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "artifact", token: false }, batched: true },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  faces: ["Ratchet, Field Medic", "Ratchet, Rescue Racer"],
  transform: true,
});
