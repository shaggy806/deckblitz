import { defineCard } from "../define.js";

// EDHREC rank 20772.
//
// Rulings:
//   [2012-05-01] If the enchanted creature becomes black, Call to Serve will be put into its
//     owner’s graveyard the next time state-based actions are performed.
//
// "Enchant nonblack creature" is the `nonblack-creature` target (Armor of
// Thorns): the state-based check asks it again of the host (704.5m).

const TEXT = "Enchanted creature gets +1/+2, has flying, and is an Angel in addition to its other types.";

export default defineCard({
  name: "Call to Serve",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant nonblack creature\n${TEXT}`,
  targets: ["nonblack-creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 2],
      grantKeywords: ["flying"],
      addSubtypes: ["Angel"],
      text: TEXT,
    },
  ],
});
