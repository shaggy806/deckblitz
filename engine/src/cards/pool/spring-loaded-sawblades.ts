import { defineCard } from "../define.js";
import { craft } from "../helpers.js";

// EDHREC rank 14459.
export default defineCard({
  name: "Spring-Loaded Sawblades",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  keywords: ["flash"],
  text: "Flash\nWhen this artifact enters, it deals 5 damage to target tapped creature an opponent controls.\nCraft with artifact {3}{W} ({3}{W}, Exile this artifact, Exile another artifact you control or an artifact card from your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", tapped: true } }],
      effect: { kind: "damage", amount: 5, target: 0 },
      resolve: null,
      text: "When this artifact enters, it deals 5 damage to target tapped creature an opponent controls.",
    },
  ],
  activated: [craft("{3}{W}", { count: 1, filter: { type: "artifact" }, text: "artifact" }, "Craft with artifact {3}{W}")],
  faces: ["Spring-Loaded Sawblades", "Bladewheel Chariot"],
  transform: true,
});
