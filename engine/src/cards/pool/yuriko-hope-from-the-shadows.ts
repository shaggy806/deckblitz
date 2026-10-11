import { defineCard } from "../define.js";

// X is read as the ability resolves: the cards in your graveyard then.
const ETB_TEXT = "When Yuriko enters, choose one —";
const SHRINK_MODE =
  "• Target creature gets -X/-0 until end of turn, where X is the number of cards in your graveyard.";
const SURVEIL_MODE = "• Surveil 2.";

export default defineCard({
  name: "Yuriko, Hope from the Shadows",
  manaCost: "{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Ninja"],
  power: 1,
  toughness: 1,
  keywords: ["flash"],
  text: `Flash\n${ETB_TEXT}\n${SHRINK_MODE}\n${SURVEIL_MODE} (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: SHRINK_MODE,
            targets: ["creature"],
            effect: {
              kind: "modify-pt",
              target: 0,
              power: { product: [{ graveyardSize: "you" }, -1] },
              toughness: 0,
              duration: "end-of-turn",
            },
          },
          { text: SURVEIL_MODE, effect: { kind: "surveil", amount: 2 } },
        ],
      },
      resolve: null,
      text: `${ETB_TEXT} ${SHRINK_MODE} ${SURVEIL_MODE}`,
    },
  ],
});
