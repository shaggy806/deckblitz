import { defineCard } from "../define.js";

// The modes and their targets are chosen as the trigger goes on the stack
// (`announced`), each mode a different player. The exiled card is its
// owner's to play — the target player's — and the window is read from that
// player's side: it ends as their next end step begins, not Casey & Raph's
// controller's.
const TRIGGER_TEXT = "When Casey & Raph enter, choose one or both. Each mode must target a different player.";
const EXILE_MODE =
  "Target player exiles the top card of their library. Until that player's next end step, they may play that card " +
  "without paying its mana cost.";
const TREASURE_MODE = "Target player creates two Treasure tokens.";

export default defineCard({
  name: "Casey & Raph, Hotheads",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Human", "Turtle"],
  power: 4,
  toughness: 4,
  text: `${TRIGGER_TEXT}\n• ${EXILE_MODE}\n• ${TREASURE_MODE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        eachTargetsDifferentPlayer: true,
        minModes: 1,
        maxModes: 2,
        modes: [
          {
            text: EXILE_MODE,
            targets: ["player"],
            effect: {
              kind: "impulse-exile",
              amount: 1,
              whose: 0,
              duration: "until-your-next-end-step",
              byOwner: true,
              play: true,
              free: true,
            },
          },
          {
            text: TREASURE_MODE,
            targets: ["player"],
            effect: { kind: "create-token", token: "Treasure Token", count: 2, who: "target-controller" },
          },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT} ${EXILE_MODE} ${TREASURE_MODE}`,
    },
  ],
});
