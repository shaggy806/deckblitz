import { defineCard } from "../define.js";

// EDHREC rank 11052. It triggers once the manifest dread is done, even if
// none of it could be (rule 701.62b); "this way" is that manifest dread's
// trip to the graveyard, the trigger's batch — usually the one card, both if
// the chosen one couldn't be manifested (701.40f), none if a replacement sent
// it elsewhere (the ruling). A card that has left the graveyard since isn't
// offered.

const TEXT = "Whenever you manifest dread, put a card you put into your graveyard this way into your hand.";

export default defineCard({
  name: "Paranormal Analyst",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "event", event: "manifests-dread", who: "you" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 1,
        max: 1,
        filter: { inSet: "trigger-batch" },
        destination: "hand",
        leftover: "stay",
        prompt: "Put a card you put into your graveyard by manifesting dread into your hand.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
