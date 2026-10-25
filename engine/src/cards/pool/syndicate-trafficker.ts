import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 24019.
export default defineCard({
  name: "Syndicate Trafficker",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Aetherborn", "Rogue"],
  power: 3,
  toughness: 1,
  text: "{1}, Sacrifice an artifact: Put a +1/+1 counter on this creature. It gains indestructible until end of turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{1}, Sacrifice an artifact: Put a +1/+1 counter on this creature. It gains indestructible until end of turn.",
    },
  ],
});
