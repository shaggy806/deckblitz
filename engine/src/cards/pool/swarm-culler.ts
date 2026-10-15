import { defineCard } from "../define.js";

// EDHREC rank 16734. Beetle-Headed Merchants' sacrifice, on becoming tapped.

const TEXT =
  "Whenever this creature becomes tapped, you may sacrifice another creature or artifact. If you do, draw a card.";

export default defineCard({
  name: "Swarm Culler",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect", "Warrior"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { typesAnyOf: ["creature", "artifact"] }, exceptSource: true, text: "Sacrifice another creature or artifact" }],
        ifDid: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
