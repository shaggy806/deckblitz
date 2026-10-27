import { defineCard } from "../define.js";

// Darksteel. EDHREC rank 32117. Ephemeron's bounce, paid with Fleshgrafter's
// "discard an artifact card".

export default defineCard({
  name: "Neurok Prodigy",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nDiscard an artifact card: Return this creature to its owner's hand.",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1, filter: { type: "artifact" } } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: "Discard an artifact card: Return this creature to its owner's hand.",
    },
  ],
});
