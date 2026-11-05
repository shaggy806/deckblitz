import { defineCard } from "../define.js";

// EDHREC rank 20511.

export default defineCard({
  name: "Rosecot Knight",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: "Vigilance\nWhen this creature enters, look at the top six cards of your library. You may reveal an artifact or enchantment card from among them and put it into your hand. Put the rest on the bottom of your library in a random order. If you didn't put a card into your hand this way, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: 6,
            reveal: "chosen",
            min: 0,
            max: 1,
            filter: { typesAnyOf: ["artifact", "enchantment"] },
            destination: "hand",
            leftover: "bottom-random",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-into-hand", atMost: 0 },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, look at the top six cards of your library. You may reveal an artifact or enchantment card from among them and put it into your hand. Put the rest on the bottom of your library in a random order. If you didn't put a card into your hand this way, put a +1/+1 counter on this creature.",
    },
  ],
});
