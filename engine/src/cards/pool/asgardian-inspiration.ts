import { defineCard } from "../define.js";

// EDHREC rank 17778. Marvel Super Heroes Commander.
//
// The impulse draw, and Spit Flame's self-return from the graveyard (it works
// only there, rule 113.6k) on Niv-Mizzet, Visionary's noncombat-damage
// trigger: once per opponent per damage event.
const IMPULSE_TEXT = "Exile the top card of your library. You may play it this turn.";
const RETURN_TEXT =
  "Whenever a source you control deals noncombat damage to an opponent, you may pay {2}. If you do, return this card from your graveyard to your hand.";

export default defineCard({
  name: "Asgardian Inspiration",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `${IMPULSE_TEXT}\n${RETURN_TEXT}`,
  effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "deals-damage", who: "you-control", to: "opponent", combat: false },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to return Asgardian Inspiration to your hand?",
        cost: "{2}",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
