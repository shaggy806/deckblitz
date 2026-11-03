import { defineCard } from "../define.js";

// Marvel's Spider-Man (SPM). A delayed trigger (rule 603.7), Stangg's shape, so a
// Mysterio that has left by the time this resolves makes tokens nothing exiles
// (the ruling). "Those tokens" are this resolution's, each watched by object.

const LEAVING = ["graveyard", "exile", "hand", "library", "command"] as const;
const EXILE_TEXT = "Exile those tokens when Mysterio leaves the battlefield.";
const TEXT = `When Mysterio enters, create a 3/3 blue Illusion Villain creature token for each nontoken Villain you control. ${EXILE_TEXT}`;

export default defineCard({
  name: "Mysterio, Master of Illusion",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "create-token",
            token: "Illusion Villain Token",
            count: { countOf: { token: false, subtype: "Villain", controlledBy: "you" } },
          },
          {
            kind: "delayed-trigger",
            at: { leaves: "source", to: LEAVING },
            about: "created",
            effect: { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 }, simultaneous: true },
            text: EXILE_TEXT,
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
