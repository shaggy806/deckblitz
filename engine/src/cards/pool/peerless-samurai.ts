import { defineCard } from "../define.js";

const ALONE_TEXT =
  "Whenever a Samurai or Warrior you control attacks alone, the next spell you cast this turn costs {1} less to cast.";

export default defineCard({
  name: "Peerless Samurai",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 2,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${ALONE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control", filter: { subtypes: ["Samurai", "Warrior"] } },
      targets: [],
      effect: { kind: "grant-spells-this-turn", next: true, reduceGeneric: 1 },
      resolve: null,
      text: ALONE_TEXT,
    },
  ],
});
