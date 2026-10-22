import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 30994.
//
// Farrel's Zealot's shape: "attacks and isn't blocked" (rule 509.3g), and the
// `may`'s `then` for "if you do".

const TEXT =
  "Whenever this creature attacks and isn't blocked, you may destroy target artifact defending player controls. If you do, this creature assigns no combat damage this turn.";

export default defineCard({
  name: "Floral Spuzzem",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [{ kind: "permanent", whose: "defending-player", filter: { type: "artifact" } }],
      effect: {
        kind: "may",
        prompt: "Destroy the targeted artifact? Floral Spuzzem then assigns no combat damage.",
        effect: { kind: "destroy", target: 0 },
        then: { kind: "assigns-no-combat-damage", target: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
