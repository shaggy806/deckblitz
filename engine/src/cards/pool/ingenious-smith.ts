import { defineCard } from "../define.js";

// EDHREC rank 13135.
const ENTER_TEXT =
  "When this creature enters, look at the top four cards of your library. You may reveal an artifact card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";
const ARTIFACT_TEXT =
  "Whenever one or more artifacts you control enter, put a +1/+1 counter on this creature. This ability triggers only once each turn.";

export default defineCard({
  name: "Ingenious Smith",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 1,
  text: `${ENTER_TEXT}\n${ARTIFACT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "artifact" },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact" }, batched: true },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ARTIFACT_TEXT,
    },
  ],
});
