import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 10279. Fight On!'s two optional slots: at most two cards in all,
// instants and sorceries mixed (the ruling).

const TEXT =
  "When this creature enters, return up to two target instant and/or sorcery cards from your graveyard to your hand.";

const SPELL_CARD: TargetSpec = { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } };

export default defineCard({
  name: "Scholar of the Ages",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: SPELL_CARD },
        { kind: "optional", of: { kind: "other", of: SPELL_CARD, than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          { kind: "return-to-hand", target: 1, from: "graveyard" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
