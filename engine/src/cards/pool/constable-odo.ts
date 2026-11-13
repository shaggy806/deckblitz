import { defineCard } from "../define.js";

// EDHREC rank 30595.

const ETB_TEXT = "When Constable Odo enters, choose one —";
const STUN_TEXT = "Tap target creature an opponent controls. Put two stun counters on it.";
const CLUE_TEXT = "Investigate twice.";

export default defineCard({
  name: "Constable Odo",
  manaCost: "{3}{W/U}{W/U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Shapeshifter", "Detective"],
  power: 4,
  toughness: 3,
  text: `${ETB_TEXT}\n• ${STUN_TEXT} (If a permanent with a stun counter would become untapped, remove one from it instead.)\n• ${CLUE_TEXT} (To investigate, create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")`,
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
            text: STUN_TEXT,
            targets: ["creature-an-opponent-controls"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "tap", target: 0 },
                { kind: "add-counter", target: 0, counter: "stun", amount: 2 },
              ],
            },
          },
          { text: CLUE_TEXT, effect: { kind: "create-token", token: "Clue Token", investigate: true, count: 2 } },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
