import { defineCard } from "../define.js";

// EDHREC rank 23883. Secrets of Strixhaven.
const COUNTER_TEXT = "When this creature enters, put a +1/+1 counter on another target creature you control.";
const EXILE_TEXT = "At the beginning of combat on your turn, exile up to one target card from a graveyard.";

export default defineCard({
  name: "Ascendant Dustspeaker",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Orc", "Cleric"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${COUNTER_TEXT}\n${EXILE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard" } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
