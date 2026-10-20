import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, choose one —\n• Put a +1/+1 counter on this creature.\n• Return target artifact or enchantment card from your graveyard to your hand.";

export default defineCard({
  name: "Trusty Retriever",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 2,
  toughness: 3,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Put a +1/+1 counter on this creature.",
            effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
          {
            text: "Return target artifact or enchantment card from your graveyard to your hand.",
            targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["artifact", "enchantment"] } }],
            effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
