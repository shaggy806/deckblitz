import { defineCard } from "../define.js";

// Ruling: lands are colorless, so a Swamp or Mountain can't be targeted unless
// something has made it black or red (the filter reads current colours).

const TEXT =
  "Whenever this creature deals combat damage to a player, you may exile target black or red permanent that player controls.";

export default defineCard({
  name: "Lightwielder Paladin",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 4,
  keywords: ["first-strike"],
  text: `First strike (This creature deals combat damage before creatures without first strike.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { anyOf: [{ colors: ["B"] }, { colors: ["R"] }] } }],
      effect: {
        kind: "may",
        prompt: "Exile the target black or red permanent?",
        effect: { kind: "exile", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
