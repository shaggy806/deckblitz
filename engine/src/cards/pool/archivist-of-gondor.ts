import { defineCard } from "../define.js";

// EDHREC rank 10141. "The monarch's end step" is a `step-begins` trigger
// keyed to whoever is the monarch as the step begins (`who: "monarch"`), and
// "that player" is the active player — who still draws if someone else
// becomes the monarch before it resolves (the ruling).

const MONARCH_TEXT = "When your commander deals combat damage to a player, if there is no monarch, you become the monarch.";
const DRAW_TEXT = "At the beginning of the monarch's end step, that player draws a card.";

export default defineCard({
  name: "Archivist of Gondor",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 3,
  text: `${MONARCH_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "any", filter: { isCommander: true, ownedBy: "you" } },
      condition: { kind: "monarch", who: "nobody" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: MONARCH_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "monarch" },
      targets: [],
      effect: { kind: "draw", amount: 1, who: "active-player" },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
