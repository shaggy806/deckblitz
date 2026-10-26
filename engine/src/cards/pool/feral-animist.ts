import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 26817.
//
// X is its power as the ability resolves (a negative power counts as 0 — the
// amount is clamped), so a second activation doubles the doubled power.

const TEXT = "{3}: This creature gets +X/+0 until end of turn, where X is its power.";

export default defineCard({
  name: "Feral Animist",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { powerOf: "source" },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
