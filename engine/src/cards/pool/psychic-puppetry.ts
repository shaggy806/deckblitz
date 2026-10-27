import { defineCard } from "../define.js";

// Champions of Kamigawa. EDHREC rank 18566. "You may tap or untap" is
// Gandalf the Grey's resolution-time choice of none or one of the two.

export default defineCard({
  name: "Psychic Puppetry",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "You may tap or untap target permanent.\nSplice onto Arcane {U} (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  splice: { onto: "arcane", cost: "{U}" },
  targets: ["permanent"],
  effect: {
    kind: "modal",
    minModes: 0,
    maxModes: 1,
    modes: [
      { text: "Tap it", effect: { kind: "tap", target: 0 } },
      { text: "Untap it", effect: { kind: "untap", target: 0 } },
    ],
  },
});
