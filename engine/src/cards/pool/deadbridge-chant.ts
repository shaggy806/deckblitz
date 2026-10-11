import { defineCard } from "../define.js";

// Rulings: the upkeep ability doesn't target, so a card put into your
// graveyard in response may be chosen; each card has an equal chance; the
// card is chosen as the ability resolves (`choose-random-card`).

const ENTERS = "When this enchantment enters, mill ten cards.";
const UPKEEP =
  "At the beginning of your upkeep, choose a card at random in your graveyard. If it's a creature card, put it onto the battlefield. Otherwise, put it into your hand.";

export default defineCard({
  name: "Deadbridge Chant",
  manaCost: "{4}{B}{G}",
  colors: ["B", "G"],
  types: ["enchantment"],
  text: `${ENTERS}\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 10 },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "choose-random-card",
        zone: "graveyard",
        then: {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { type: "creature" } },
          then: { kind: "put-onto-battlefield", target: 0 },
          else: { kind: "return-to-hand", target: 0, from: "graveyard" },
        },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
