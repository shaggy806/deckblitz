import { defineCard } from "../define.js";

const BLOCK_TEXT = "This creature can't block.";
const RETURN_TEXT =
  "Whenever you attack with three or more creatures, you may pay {R}{R}. If you do, return this card from your graveyard to the battlefield tapped and attacking with a +1/+1 counter on it.";

export default defineCard({
  name: "Phoenix Chick",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${BLOCK_TEXT}\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: BLOCK_TEXT,
    },
  ],
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "attack-with", who: "you", atLeast: 3, filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {R}{R} to return Phoenix Chick tapped and attacking with a +1/+1 counter?",
        cost: "{R}{R}",
        effect: {
          kind: "put-onto-battlefield",
          target: "source",
          enterTapped: true,
          attacking: "choose",
          withCounters: { kind: "+1/+1", amount: 1 },
        },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
