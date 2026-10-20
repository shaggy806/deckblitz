import { defineCard } from "../define.js";

// EDHREC rank 16603. The cast trigger always triggers and checks as it
// resolves whether you control a qualifying permanent — one copy however
// many you control (the ruling). The subtypes are any permanent's, not only
// a creature's.
const COPY_TEXT =
  "When you cast this spell, copy it if you control a planeswalker, Cleric, Druid, Shaman, Warlock, or Wizard.";
const SPELL_TEXT = "Scry 1, then draw a card.";

export default defineCard({
  name: "Mentor's Guidance",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: `${COPY_TEXT}\n${SPELL_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "controls",
          filter: {
            anyOf: [{ type: "planeswalker" }, { subtypes: ["Cleric", "Druid", "Shaman", "Warlock", "Wizard"] }],
          },
          atLeast: 1,
        },
        then: { kind: "copy-spell", target: "trigger-spell" },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
  effect: { kind: "scry", amount: 1, then: { kind: "draw", amount: 1 } },
});
