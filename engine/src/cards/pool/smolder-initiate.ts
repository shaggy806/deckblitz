import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 28195.
//
// Throne of Bone's trigger; the player is targeted as it triggers, the {1}
// asked as it resolves.

const TEXT = "Whenever a player casts a black spell, you may pay {1}. If you do, target player loses 1 life.";

export default defineCard({
  name: "Smolder Initiate",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["B"] } },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Pay {1} to have the targeted player lose 1 life?",
        cost: "{1}",
        effect: { kind: "lose-life", amount: 1, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
