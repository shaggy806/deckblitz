import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 31706. Wretched Throng's self-tutor on entering.

const ETB_TEXT =
  "When this creature enters, you may search your library for a card named Avarax, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Avarax",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${ETB_TEXT}\n{1}{R}: This creature gets +1/+0 until end of turn.`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{R}: This creature gets +1/+0 until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a card named Avarax?",
        effect: { kind: "search-library", filter: { name: "Avarax" }, destination: "hand", min: 0, max: 1, reveal: true },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
