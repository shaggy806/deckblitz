import { defineCard } from "../define.js";
import { craft } from "../helpers.js";

const ENTER_TEXT = "When this artifact enters, each opponent sacrifices a creature of their choice.";
const CRAFT_TEXT =
  "Craft with creature {4}{B} ({4}{B}, Exile this artifact, Exile a creature you control or a creature card from your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)";

export default defineCard({
  name: "Tithing Blade",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${CRAFT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [craft("{4}{B}", { count: 1, filter: { type: "creature" }, text: "creature" }, "Craft with creature {4}{B}")],
  faces: ["Tithing Blade", "Consuming Sepulcher"],
  transform: true,
});
