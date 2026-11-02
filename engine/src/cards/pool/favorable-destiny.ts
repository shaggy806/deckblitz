import { defineCard } from "../define.js";

const WHITE = "Enchanted creature gets +1/+2 as long as it's white.";
const SHROUD = "Enchanted creature has shroud as long as its controller controls another creature.";

export default defineCard({
  name: "Favorable Destiny",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${WHITE}\n${SHROUD}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { colors: ["W"] } } },
      grantPt: [1, 2],
      text: WHITE,
    },
    {
      affects: { scope: "attached" },
      condition: {
        kind: "of-player",
        player: "host-controller",
        condition: { kind: "controls", filter: { type: "creature" }, atLeast: 1, excludeHost: true },
      },
      grantKeywords: ["shroud"],
      text: SHROUD,
    },
  ],
});
