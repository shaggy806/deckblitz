import { defineCard } from "../define.js";

// The end-step ability works only from the graveyard (`fromGraveyard`), with
// "an opponent was dealt 3 or more damage this turn" an intervening if over
// one opponent's damage, whenever it was dealt (its rulings).

const RETURN_TEXT =
  "At the beginning of your end step, if an opponent was dealt 3 or more damage this turn, you may pay {R}. If you do, return this card from your graveyard to the battlefield.";

export default defineCard({
  name: "Lightning Phoenix",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "haste"],
  text: `Flying, haste\nThis creature can't block.\n${RETURN_TEXT}`,
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: "This creature can't block." }],
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "damage-taken", who: "opponent", atLeast: 3 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {R} to return Lightning Phoenix to the battlefield?",
        cost: "{R}",
        effect: { kind: "put-onto-battlefield", target: "source" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
