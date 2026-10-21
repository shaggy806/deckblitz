import { defineCard } from "../define.js";

// Rekindling Phoenix's 0/1 red Elemental. With no card named Rekindling
// Phoenix in its controller's graveyard the ability has no target and is
// removed from the stack, so the token isn't sacrificed (the Phoenix's
// ruling); the name is the card's printed one, not a copy's.

const TEXT =
  "At the beginning of your upkeep, sacrifice this token and return target card named Rekindling Phoenix from your graveyard to the battlefield. It gains haste until end of turn.";

export default defineCard({
  name: "Elemental Token (Rekindling Phoenix)",
  art: "512fedf8-f50d-4e81-9856-e051850dc05f",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { name: "Rekindling Phoenix" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice-source" },
          { kind: "put-onto-battlefield", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
