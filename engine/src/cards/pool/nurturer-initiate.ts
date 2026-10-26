import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 28912.
//
// Wooden Sphere's trigger; the creature is targeted as it triggers, the {1}
// asked as it resolves.

const TEXT =
  "Whenever a player casts a green spell, you may pay {1}. If you do, target creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Nurturer Initiate",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["G"] } },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Pay {1} to give the targeted creature +1/+1 until end of turn?",
        cost: "{1}",
        effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
