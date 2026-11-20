import { defineCard } from "../define.js";

// EDHREC rank 16848.
//
// "Exile them": the cards of the discard that are in your graveyard as it
// resolves, each the object it was as it was discarded (rule 400.7) — the
// discard trigger's batch (`"trigger-batch"`) — exiled linked to Toluz
// (rule 607.2a), so its dies trigger returns them. One that has left the
// graveyard since stays where it is.

const CONNIVE_TEXT = "When Toluz enters, it connives.";
const DISCARD_TEXT = "Whenever you discard one or more cards, exile them from your graveyard.";
const DIES_TEXT = "When Toluz dies, put the cards exiled with it into their owner's hand.";

export default defineCard({
  name: "Toluz, Clever Conductor",
  manaCost: "{W/U}{U}{U/B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 1,
  text: `${CONNIVE_TEXT} (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)\n${DISCARD_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "connive", target: "source" },
      resolve: null,
      text: CONNIVE_TEXT,
    },
    {
      trigger: { on: "discards", who: "you" },
      targets: [],
      effect: { kind: "exile-graveyard", target: "you", filter: { inSet: "trigger-batch" }, linked: true },
      resolve: null,
      text: DISCARD_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "hand" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
