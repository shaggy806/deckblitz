import { defineCard } from "../define.js";

// The target is chosen after it connives (the ruling): a reflexive trigger
// (rule 603.12). It connives even if it has left the battlefield, so the
// reflexive ability always triggers.
const TEXT =
  "When this creature enters, it connives. When it connives this way, return up to one target nonland permanent to its owner's hand. (To have a creature connive, draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)";

export default defineCard({
  name: "Psychic Pickpocket",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus", "Rogue"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "connive", target: "source" },
          {
            kind: "reflexive-trigger",
            targets: [{ kind: "optional", of: "nonland-permanent" }],
            effect: { kind: "return-to-hand", target: 0 },
            text: "When it connives this way, return up to one target nonland permanent to its owner's hand.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
