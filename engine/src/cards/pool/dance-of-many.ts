import { defineCard } from "../define.js";

const LEAVING = ["graveyard", "exile", "hand", "library", "command"] as const;
const COPY_TEXT = "When this enchantment enters, create a token that's a copy of target nontoken creature.";
const EXILE_TEXT = "When this enchantment leaves the battlefield, exile the token.";
const SACRIFICE_TEXT = "When the token leaves the battlefield, sacrifice this enchantment.";
const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice this enchantment unless you pay {U}{U}.";

// The two "leaves" abilities are linked to the token the first one made
// (rule 607.2a), so each watches that token from its creation: a Dance that
// left before its copy ability resolved has nothing to exile, and its token
// stays (its ruling).
export default defineCard({
  name: "Dance of Many",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${COPY_TEXT}\n${EXILE_TEXT}\n${SACRIFICE_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", token: false } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token-copy", of: 0, count: 1, who: "you" },
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
      text: COPY_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{U}{U}", text: "Pay {U}{U}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
