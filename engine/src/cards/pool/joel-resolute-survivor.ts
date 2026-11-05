import { defineCard } from "../define.js";

// EDHREC rank 22115.

export default defineCard({
  name: "Joel, Resolute Survivor",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Survivor"],
  power: 4,
  toughness: 4,
  keywords: ["menace"],
  pairing: { kind: "partner-group", group: "Survivors" },
  text: "Menace\nWhenever a creature token dies, put a +1/+1 counter on Joel and draw a card. This ability triggers only once each turn.\nPartner—Survivors (You can have two commanders if both have this ability.)",
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { token: true, type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever a creature token dies, put a +1/+1 counter on Joel and draw a card. This ability triggers only once each turn.",
      oncePerTurn: true,
    },
  ],
});
