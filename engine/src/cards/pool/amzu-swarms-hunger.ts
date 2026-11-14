import { defineCard } from "../define.js";

// Ravnica: Clue Edition (CLU). The leaves-graveyard trigger is the batched
// one: cards leaving together trigger it once (the card's ruling). Its value
// is the greatest mana value among the cards that left, each as it was in
// the graveyard, fixed as it triggers (`batchValue`), so a card returned to
// a hand or shuffled away still counts. "Do this only once each turn" is the
// `may`'s `oncePerTurn`: the trigger fires every time, and only one token a
// turn is made; a declined one doesn't use it up.

const LEAVE =
  "Whenever one or more cards leave your graveyard, you may create a 1/1 black and green Insect creature token, then put a number of +1/+1 counters on it equal to the greatest mana value among those cards. Do this only once each turn.";

export default defineCard({
  name: "Amzu, Swarm's Hunger",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Insect", "Shaman"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "menace"],
  text: `Flying, menace\nOther Insects you control have menace.\n${LEAVE}`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Insect", excludeSelf: true },
      grantKeywords: ["menace"],
      text: "Other Insects you control have menace.",
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-graveyard", who: "you", batchValue: "greatest-mana-value" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a 1/1 Insect token with +1/+1 counters?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "create-token", token: "Insect Token (Black-Green)", count: 1, separate: true },
            { kind: "add-counter", target: "created", counter: "+1/+1", amount: { triggerValue: true } },
          ],
        },
        oncePerTurn: true,
      },
      resolve: null,
      text: LEAVE,
    },
  ],
});
