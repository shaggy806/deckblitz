import { defineCard } from "../define.js";

// EDHREC rank 8082. Past in Flames' grant on an attack trigger: the cards are
// fixed as it resolves, and it resolves even if the Hellkite has left.

const TEXT =
  "Whenever this creature attacks, each instant and sorcery card in your graveyard gains flashback until end of turn. The flashback cost is equal to its mana cost.";

export default defineCard({
  name: "Backdraft Hellkite",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "grant-flashback-all", filter: { typesAnyOf: ["instant", "sorcery"] } },
      resolve: null,
      text: TEXT,
    },
  ],
});
