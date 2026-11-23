import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). "Choose one that hasn't been chosen" is
// this object's own memory (rule 400.7): Go to Sleep returns a new object,
// which can choose all four again.

const TRIGGER_TEXT = "Whenever an opponent draws a card, choose one that hasn't been chosen —";
const FRIENDS = "Make Friends — Create a 1/1 colorless Gamer creature token.";
const CARDS = "Find Cards — Investigate.";
const TICKETS = "Win Prize Tickets — Create a Treasure token.";
const SLEEP = "Go to Sleep — Exile this creature, then return it to the battlefield under its owner's control.";

export default defineCard({
  name: "MagicConsecrated Sphinx",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 4,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}\n• ${FRIENDS}\n• ${CARDS}\n• ${TICKETS}\n• ${SLEEP}`,
  triggered: [
    {
      trigger: { on: "draws", who: "opponent" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        notChosenBefore: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: FRIENDS, effect: { kind: "create-token", token: "Gamer Token", count: 1 } },
          { text: CARDS, effect: { kind: "create-token", token: "Clue Token", count: 1, investigate: true } },
          { text: TICKETS, effect: { kind: "create-token", token: "Treasure Token", count: 1 } },
          { text: SLEEP, effect: { kind: "flicker", target: "source" } },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT} ${FRIENDS} ${CARDS} ${TICKETS} ${SLEEP}`,
    },
  ],
});
