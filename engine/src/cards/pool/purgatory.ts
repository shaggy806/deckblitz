import { defineCard } from "../define.js";

// "Your graveyard": a card you own (rule 404.1), whoever controlled it. The
// return is under its owner's control, which matters only once someone else
// controls this enchantment.
const EXILE = "Whenever a nontoken creature is put into your graveyard from the battlefield, exile that card.";
const RETURN =
  "At the beginning of your upkeep, you may pay {4} and 2 life. If you do, return a card exiled with this enchantment to the battlefield.";

export default defineCard({
  name: "Purgatory",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  text: `${EXILE}\n${RETURN}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", token: false, ownedBy: "you" } },
      targets: [],
      effect: { kind: "exile", target: "trigger-object", linked: true },
      resolve: null,
      text: EXILE,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {4} and 2 life to return a card exiled with Purgatory to the battlefield?",
        cost: "{4}",
        costLife: 2,
        effect: {
          kind: "look-and-choose",
          zone: "exiled-with-source",
          min: 1,
          max: 1,
          destination: "battlefield",
          under: "owners",
          leftover: "stay",
        },
      },
      resolve: null,
      text: RETURN,
    },
  ],
});
