import { defineCard } from "../define.js";

export default defineCard({
  name: "Archon of the Triumvirate",
  manaCost: "{5}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Archon"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature attacks, detain up to two target nonland permanents your opponents control. (Until your next turn, those permanents can't attack or block and their activated abilities can't be activated.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: "nonland-permanent-an-opponent-controls" }, { kind: "optional", of: { kind: "other", of: "nonland-permanent-an-opponent-controls", than: { slot: 0 } } }],
      effect: { kind: "sequence", effects: [{ kind: "detain", target: 0 }, { kind: "detain", target: 1 }] },
      resolve: null,
      text: "Whenever this creature attacks, detain up to two target nonland permanents your opponents control.",
    },
  ],
});
