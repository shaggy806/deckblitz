import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 30517.

export default defineCard({
  name: "Jorubai Murk Lurker",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Leech"],
  power: 1,
  toughness: 3,
  text: "This creature gets +1/+1 as long as you control a Swamp.\n{1}{B}: Target creature gains lifelink until end of turn. (Damage dealt by the creature also causes its controller to gain that much life.)",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Swamp" }, atLeast: 1 },
      grantPt: [1, 1],
      text: "This creature gets +1/+1 as long as you control a Swamp.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: "{1}{B}: Target creature gains lifelink until end of turn.",
    },
  ],
});
