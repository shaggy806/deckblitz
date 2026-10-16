import { defineCard } from "../define.js";

export default defineCard({
  name: "Blaring Recruiter",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 2,
  toughness: 2,
  pairing: { kind: "partner-with", name: "Blaring Captain" },
  text: "Partner with Blaring Captain (When this creature enters, target player may put Blaring Captain into their hand from their library, then shuffle.)\n{2}{W}: Create a 1/1 white Warrior creature token.",
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Warrior Token", count: 1 },
      resolve: null,
      text: "{2}{W}: Create a 1/1 white Warrior creature token.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        // "… **may** search": that player's choice (`each-player-may`), so
        // declining neither searches nor shuffles their library.
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Blaring Captain?",
        effect: {
          kind: "search-library",
          filter: { name: "Blaring Captain" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Blaring Captain, reveal it, put it into their hand, then shuffle.",
    },
  ],
});
