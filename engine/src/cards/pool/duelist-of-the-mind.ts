import { defineCard } from "../define.js";

// EDHREC rank 10580.
//
// Its power is a characteristic-defining ability (rule 604.3), so it works in
// every zone (its ruling): in a hand or graveyard it counts its owner's draws.
// A crime is committed as a spell or ability that targets an opponent, or
// something of theirs, is cast, activated or put on the stack (rule 700.13,
// the `commits-crime` event).

const POWER = "Duelist of the Mind's power is equal to the number of cards you've drawn this turn.";
const LOOT =
  "Whenever you commit a crime, you may draw a card. If you do, discard a card. This ability triggers only once each turn.";

export default defineCard({
  name: "Duelist of the Mind",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 0,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${POWER}\n${LOOT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { turnStat: "cards-drawn" }, plusPower: 0, plusToughness: 0, only: "power" },
      text: POWER,
    },
  ],
  triggered: [
    {
      trigger: { on: "event", event: "commits-crime", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card, then discard a card?",
        effect: { kind: "draw", amount: 1 },
        then: { kind: "discard", target: "you", amount: 1 },
      },
      oncePerTurn: true,
      resolve: null,
      text: LOOT,
    },
  ],
});
