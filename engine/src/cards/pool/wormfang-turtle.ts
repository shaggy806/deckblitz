import { defineCard } from "../define.js";

// EDHREC rank 24142.
// "Exile a land you control" isn't targeted: the land is chosen as the
// trigger resolves (`choose-permanents`, exactly one when there is one) and
// exiled linked to the Turtle, which the leaves trigger returns — Journey to
// Nowhere's pair. If the Turtle has left before the enters trigger resolves,
// the land is still exiled and never comes back (the old-style wording).

export default defineCard({
  name: "Wormfang Turtle",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Nightmare", "Turtle", "Beast"],
  power: 2,
  toughness: 4,
  text: "When this creature enters, exile a land you control.\nWhen this creature leaves the battlefield, return the exiled card to the battlefield under its owner's control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "land", controlledBy: "you" },
        upTo: 1,
        min: 1,
        prompt: "Exile a land you control",
        then: { kind: "exile", target: 0, linked: true },
      },
      resolve: null,
      text: "When this creature enters, exile a land you control.",
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield" },
      resolve: null,
      text: "When this creature leaves the battlefield, return the exiled card to the battlefield under its owner's control.",
    },
  ],
});
