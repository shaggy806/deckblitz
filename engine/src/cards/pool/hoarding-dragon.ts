import { defineCard } from "../define.js";

// The artifact is exiled linked to this Dragon (rule 607.2a), so the dies
// trigger finds only what this object exiled; a countered or flickered Dragon's
// card stays where it is.

const ENTER_TEXT = "When this creature enters, you may search your library for an artifact card, exile it, then shuffle.";
const DIES_TEXT = "When this creature dies, you may put the exiled card into its owner's hand.";

export default defineCard({
  name: "Hoarding Dragon",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for an artifact card?",
        effect: { kind: "search-library", filter: { type: "artifact" }, destination: "exile", min: 0, max: 1, linked: true },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put the exiled card into its owner's hand?",
        effect: { kind: "return-exiled-by-source", linked: "hand" },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
