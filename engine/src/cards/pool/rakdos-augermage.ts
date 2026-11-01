import { defineCard } from "../define.js";

// You reveal and discard first, of the opponent's choice; then they do, of yours.
const TEXT =
  "{T}: Reveal your hand and discard a card of target opponent's choice. Then that player reveals their hand and " +
  "discards a card of your choice. Activate only as a sorcery.";

export default defineCard({
  name: "Rakdos Augermage",
  manaCost: "{B}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      sorcerySpeed: true,
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-chosen", target: "you", chooser: { target: 0 } },
          { kind: "discard-chosen", target: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
