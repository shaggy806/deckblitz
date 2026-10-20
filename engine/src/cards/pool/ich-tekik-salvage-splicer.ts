import { defineCard } from "../define.js";

// EDHREC rank 11274.
//
// Rulings:
//   [2020-11-10] If Ich-Tekik leaves the battlefield before its middle ability resolves, you'll
//     still put a +1/+1 counter on each Golem you control.
//   [2020-11-10] Artifact tokens that are destroyed or otherwise die are put into the graveyard
//     before ceasing to exist. They will cause Ich-Tekik's middle ability to trigger.
//
// Any artifact, anyone's, put into a graveyard from the battlefield (Savior of
// the Sleeping's `dies` on a noncreature filter).

const ENTER_TEXT = "When Ich-Tekik enters, create a 3/3 colorless Phyrexian Golem artifact creature token.";
const ARTIFACT_TEXT =
  "Whenever an artifact is put into a graveyard from the battlefield, put a +1/+1 counter on Ich-Tekik and a +1/+1 counter on each Golem you control.";

export default defineCard({
  name: "Ich-Tekik, Salvage Splicer",
  manaCost: "{4}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Human", "Artificer"],
  power: 1,
  toughness: 1,
  pairing: { kind: "partner" },
  text: `${ENTER_TEXT}\n${ARTIFACT_TEXT}\nPartner (You can have two commanders if both have partner.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Golem Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          {
            kind: "add-counter-all",
            filter: { subtype: "Golem", controlledBy: "you" },
            counter: "+1/+1",
            amount: 1,
          },
        ],
      },
      resolve: null,
      text: ARTIFACT_TEXT,
    },
  ],
});
