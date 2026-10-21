import { defineCard } from "../define.js";

// EDHREC rank 30571.
//
// The Ral planeswalker is an intervening if (rule 603.4), checked as it
// triggers and as it resolves; the hand is counted once, as it resolves,
// and the bonus stays for the turn (the rulings).
const TEXT =
  "Whenever this creature attacks, if you control a Ral planeswalker, this creature gets +1/+0 for each card in your hand until end of turn.";

export default defineCard({
  name: "Ral's Staticaster",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Lizard", "Wizard"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Ral" }, atLeast: 1 },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { cardsInHand: "you" },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
