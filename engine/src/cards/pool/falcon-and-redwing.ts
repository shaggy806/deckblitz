import { defineCard } from "../define.js";

// EDHREC rank 10544.
//
// "That many" is the combat damage dealt; the counter goes on after the
// Birds, on Falcon and Redwing if they're still on the battlefield.
const TEXT =
  "Whenever Falcon and Redwing deal combat damage to a player, create that many 1/1 white Bird creature tokens with flying, then put a +1/+1 counter on Falcon and Redwing.";

export default defineCard({
  name: "Falcon and Redwing",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Bird", "Hero"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Bird Token", count: { triggerValue: true } },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
