import { defineCard } from "../define.js";

const TEXT =
  "Whenever Zara attacks, look at defending player's hand. You may put a creature card from it onto the battlefield under your control tapped and attacking that player or a planeswalker they control. Return that creature to its owner's hand at the beginning of the next end step.";

export default defineCard({
  name: "Zara, Renegade Recruiter",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      resolve: null,
      text: TEXT,
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        from: "trigger-player",
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "battlefield",
        leftover: "stay",
        under: "you",
        enterTapped: true,
        attacking: { player: "trigger-player", orTheirPlaneswalker: true },
        then: {
          kind: "delayed-trigger",
          at: "next-end-step",
          text: "Return that creature to its owner's hand.",
          effect: { kind: "return-to-hand", target: 0 },
        },
      },
    },
  ],
});
