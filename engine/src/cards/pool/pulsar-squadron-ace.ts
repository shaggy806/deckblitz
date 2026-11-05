import { defineCard } from "../define.js";

// EDHREC rank 22573.

export default defineCard({
  name: "Pulsar Squadron Ace",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 1,
  toughness: 2,
  text: "When this creature enters, look at the top five cards of your library. You may reveal a Spacecraft card from among them and put it into your hand. Put the rest on the bottom of your library in a random order. If you didn't put a card into your hand this way, put a +1/+1 counter on this creature.",
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
            count: 5,
            reveal: "chosen",
            min: 0,
            max: 1,
            filter: { subtype: "Spacecraft" },
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
      text: "When this creature enters, look at the top five cards of your library. You may reveal a Spacecraft card from among them and put it into your hand. Put the rest on the bottom of your library in a random order. If you didn't put a card into your hand this way, put a +1/+1 counter on this creature.",
    },
  ],
});
