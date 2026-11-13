import { defineCard } from "../define.js";

// EDHREC rank 3229.
// Rulings:
//   [2021-04-16] Creatures your opponents control attacking one of your opponents will cause
//     Frontier Warmonger's ability to trigger.
//
// Once per opponent attacked (rule 508.3d), the creatures attacking that
// opponent and those attacking a planeswalker they control counted together
// (`orTheirPlaneswalkers`).

const TEXT =
  "Whenever one or more creatures attack one of your opponents or a planeswalker they control, those creatures gain menace until end of turn.";

export default defineCard({
  name: "Frontier Warmonger",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 4,
  text: `${TEXT} (They can't be blocked except by two or more creatures.)`,
  triggered: [
    {
      trigger: { on: "attacks-player", who: "any", defender: "opponent", orTheirPlaneswalkers: true },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { inSet: "trigger-batch" },
        keyword: "menace",
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
