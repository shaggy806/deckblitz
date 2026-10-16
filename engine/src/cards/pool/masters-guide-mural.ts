import { defineCard } from "../define.js";
import { craft } from "../helpers.js";

const ENTER_TEXT = "When this artifact enters, create a 4/4 white and blue Golem artifact creature token.";
const CRAFT_TEXT =
  "Craft with artifact {4}{W}{W}{U} ({4}{W}{W}{U}, Exile this artifact, Exile another artifact you control or an artifact card from your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)";

export default defineCard({
  name: "Master's Guide-Mural",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${CRAFT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Golem Token (Master's Guide-Mural // Master's Manufactory)", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    craft("{4}{W}{W}{U}", { count: 1, filter: { type: "artifact" }, text: "artifact" }, "Craft with artifact {4}{W}{W}{U}"),
  ],
  faces: ["Master's Guide-Mural", "Master's Manufactory"],
  transform: true,
});
