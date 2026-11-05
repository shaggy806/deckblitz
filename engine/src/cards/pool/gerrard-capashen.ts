import { defineCard } from "../define.js";

const UPKEEP = "At the beginning of your upkeep, you gain 1 life for each card in target opponent's hand.";
const TAP = "{3}{W}: Tap target creature. Activate only if Gerrard Capashen is attacking.";

export default defineCard({
  name: "Gerrard Capashen",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 4,
  text: `${UPKEEP}\n${TAP}`,
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      condition: { kind: "source", filter: { attacking: true } },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TAP,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["opponent"],
      effect: { kind: "gain-life", amount: { cardsInHand: { target: 0 } } },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
