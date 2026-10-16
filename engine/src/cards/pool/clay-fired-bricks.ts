import { defineCard } from "../define.js";
import { craft } from "../helpers.js";

const ENTER_TEXT =
  "When this artifact enters, search your library for a basic Plains card, reveal it, put it into your hand, then shuffle. You gain 2 life.";
const CRAFT_TEXT =
  "Craft with artifact {5}{W}{W} ({5}{W}{W}, Exile this artifact, Exile another artifact you control or an artifact card from your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)";

export default defineCard({
  name: "Clay-Fired Bricks",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${CRAFT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "search-library",
            filter: { supertype: "basic", subtype: "Plains" },
            destination: "hand",
            min: 0,
            max: 1,
            reveal: true,
          },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [craft("{5}{W}{W}", { count: 1, filter: { type: "artifact" }, text: "artifact" }, "Craft with artifact {5}{W}{W}")],
  faces: ["Clay-Fired Bricks", "Cosmium Kiln"],
  transform: true,
});
