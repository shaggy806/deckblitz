import { defineCard } from "../define.js";
import { checkLandStatic } from "../helpers.js";

// The last ability sets up a turn-long delayed trigger: it fires each time
// you declare attackers this turn, with the land gone or not (the ruling).
// The tokens attack a player or planeswalker of your choice (rule 508.4).

const ATTACK_TEXT =
  "{2}{W}, {T}: Whenever you attack this turn, create two 1/1 red Warrior creature tokens that are tapped and attacking. Sacrifice them at the beginning of the next end step.";

export default defineCard({
  name: "Dalkovan Encampment",
  colors: [],
  types: ["land"],
  text: `This land enters tapped unless you control a Swamp or a Mountain.\n{T}: Add {W}.\n${ATTACK_TEXT}`,
  static: [checkLandStatic("Dalkovan Encampment", ["Swamp", "Mountain"])],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "W", amount: 1 },
      resolve: null,
      text: "{T}: Add {W}.",
    },
    {
      cost: { mana: "{2}{W}", tap: true },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "attack-with", who: "you", atLeast: 1 } },
        effect: {
          kind: "create-token",
          token: "Red Warrior Token",
          count: 2,
          tapped: true,
          attacking: "choose",
          sacrificeAtEndStep: true,
        },
        text: "Whenever you attack this turn, create two 1/1 red Warrior creature tokens that are tapped and attacking. Sacrifice them at the beginning of the next end step.",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
