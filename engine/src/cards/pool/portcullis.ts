import { defineCard } from "../define.js";

// Not `exile { untilSourceLeaves }`: the return is a delayed trigger the exile
// sets up (the ruling: "set up as part of the ability that exiles the creature",
// so it fires even if Portcullis has lost its abilities), which a Portcullis
// already gone as this resolves never fires.

const LEAVING = ["graveyard", "exile", "hand", "library", "command"] as const;
const RETURN = "Return that card to the battlefield under its owner's control when this artifact leaves the battlefield.";
const TEXT = `Whenever a creature enters, if there are two or more other creatures on the battlefield, exile that creature. ${RETURN}`;

export default defineCard({
  name: "Portcullis",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" } },
      condition: {
        kind: "controls",
        filter: { type: "creature" },
        atLeast: 2,
        anyController: true,
        excludeTriggerObject: true,
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          {
            kind: "delayed-trigger",
            at: { leaves: "source", to: LEAVING },
            about: "exiled",
            effect: { kind: "put-onto-battlefield", target: 0 },
            text: RETURN,
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
