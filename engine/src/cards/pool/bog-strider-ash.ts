import { defineCard } from "../define.js";

// Lorwyn (LRW). EDHREC rank 28974. Urza's Chalice's pay-to-gain shape.
const TEXT = "Whenever a player casts a Goblin spell, you may pay {G}. If you do, you gain 2 life.";

export default defineCard({
  name: "Bog-Strider Ash",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Shaman"],
  power: 2,
  toughness: 4,
  keywords: ["swampwalk"],
  text: `Swampwalk (This creature can't be blocked as long as defending player controls a Swamp.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { subtype: "Goblin" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {G} to gain 2 life?",
        cost: "{G}",
        effect: { kind: "gain-life", amount: 2 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
