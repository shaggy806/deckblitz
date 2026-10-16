import { defineCard } from "../define.js";
import { craft } from "../helpers.js";

export default defineCard({
  name: "Oteclan Landmark",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact"],
  text: "When this artifact enters, scry 2.\nCraft with artifact {2}{W} ({2}{W}, Exile this artifact, Exile another artifact you control or an artifact card from your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: "When this artifact enters, scry 2.",
    },
  ],
  activated: [craft("{2}{W}", { count: 1, filter: { type: "artifact" }, text: "artifact" }, "Craft with artifact {2}{W}")],
  faces: ["Oteclan Landmark", "Oteclan Levitator"],
  transform: true,
});
