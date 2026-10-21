import { defineCard } from "../define.js";

// EDHREC rank 27206. Guilds of Ravnica. Vito's Inquisitor's sacrifice outlet,
// at sorcery speed.

const ABILITY_TEXT =
  "{1}, Sacrifice another creature: Put a +1/+1 counter on this creature. It gains menace until end of turn. Activate only as a sorcery.";

export default defineCard({
  name: "Undercity Necrolisk",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Lizard"],
  power: 3,
  toughness: 3,
  text: `${ABILITY_TEXT} (It can't be blocked except by two or more creatures.)`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { type: "creature" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
      otherOnly: true,
      sorcerySpeed: true,
    },
  ],
});
