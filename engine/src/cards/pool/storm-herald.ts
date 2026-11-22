import { defineCard } from "../define.js";

// EDHREC rank 19971. Each Aura's host is chosen as it enters, among creatures
// you control (Storm Herald itself among them — the ruling); one that can't
// enchant any of them can't be chosen (rule 303.4i, the ruling). Only the
// Auras returned are exiled at the end step, and the exile-instead
// replacement is this resolution's (rule 614.1a), set on each returned Aura
// and gone once it leaves (rule 400.7 — an Aura another effect exiles and
// returns is free of it, the ruling).
const TEXT =
  "When this creature enters, return any number of Aura cards from your graveyard to the battlefield attached to creatures you control. Exile those Auras at the beginning of your next end step. If those Auras would leave the battlefield, exile them instead of putting them anywhere else.";

export default defineCard({
  name: "Storm Herald",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 3,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "return-from-graveyard",
            filter: { subtype: "Aura" },
            destination: "battlefield",
            count: 99,
            upTo: true,
            attachedTo: { among: { type: "creature", controlledBy: "you" } },
            exileIfItWouldLeave: true,
          },
          {
            kind: "delayed-trigger",
            at: { step: "end", whose: "you" },
            about: "put-onto-battlefield",
            effect: { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 }, simultaneous: true },
            text: "Exile those Auras.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
