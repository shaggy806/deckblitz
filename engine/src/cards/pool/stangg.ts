import { defineCard } from "../define.js";

const LEAVING = ["graveyard", "exile", "hand", "library", "command"] as const;
const EXILE_TEXT = "Exile that token when Stangg leaves the battlefield.";
const SACRIFICE_TEXT = "Sacrifice Stangg when that token leaves the battlefield.";
const TEXT = `When Stangg enters, create Stangg Twin, a legendary 3/4 red and green Human Warrior creature token. ${EXILE_TEXT} ${SACRIFICE_TEXT}`;

// Two delayed triggers (rule 603.7), so a Stangg that has left by the time this
// resolves makes a Twin nothing will exile (the ruling).
export default defineCard({
  name: "Stangg",
  manaCost: "{4}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Stangg Twin", count: 1 },
          {
            kind: "delayed-trigger",
            at: { leaves: "source", to: LEAVING },
            about: "created",
            effect: { kind: "exile", target: 0 },
            text: EXILE_TEXT,
          },
          {
            kind: "delayed-trigger",
            at: { leaves: "created", to: LEAVING },
            effect: { kind: "sacrifice-source" },
            text: SACRIFICE_TEXT,
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
