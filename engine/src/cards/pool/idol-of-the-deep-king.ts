import { defineCard } from "../define.js";
import { craft } from "../helpers.js";

// EDHREC rank 20636.
export default defineCard({
  name: "Idol of the Deep King",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact"],
  keywords: ["flash"],
  text: "Flash\nWhen this artifact enters, it deals 2 damage to any target.\nCraft with artifact {2}{R} ({2}{R}, Exile this artifact, Exile another artifact you control or an artifact card from your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "When this artifact enters, it deals 2 damage to any target.",
    },
  ],
  activated: [craft("{2}{R}", { count: 1, filter: { type: "artifact" }, text: "artifact" }, "Craft with artifact {2}{R}")],
  faces: ["Idol of the Deep King", "Sovereign's Macuahuitl"],
  transform: true,
});
