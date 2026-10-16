import { defineCard } from "../define.js";
import { craft } from "../helpers.js";

// EDHREC rank 14541.
//
// Collector's Case's "tap up to one target … and put two stun counters on
// it", over artifacts too; an already-tapped one just gets the counters (the
// ruling).
export default defineCard({
  name: "Lodestone Needle",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  keywords: ["flash"],
  text: "Flash\nWhen this artifact enters, tap up to one target artifact or creature and put two stun counters on it.\nCraft with artifact {2}{U} ({2}{U}, Exile this artifact, Exile another artifact you control or an artifact card from your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "artifact-or-creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 2 },
        ],
      },
      resolve: null,
      text: "When this artifact enters, tap up to one target artifact or creature and put two stun counters on it.",
    },
  ],
  activated: [craft("{2}{U}", { count: 1, filter: { type: "artifact" }, text: "artifact" }, "Craft with artifact {2}{U}")],
  faces: ["Lodestone Needle", "Guidestone Compass"],
  transform: true,
});
