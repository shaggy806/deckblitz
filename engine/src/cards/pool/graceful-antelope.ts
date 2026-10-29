import { defineCard } from "../define.js";

// Rule 305.7: the land is a Plains with only "{T}: Add {W}" until this
// creature leaves the battlefield — nothing, if it already has (611.2b).
export default defineCard({
  name: "Graceful Antelope",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Antelope"],
  power: 1,
  toughness: 4,
  keywords: ["plainswalk"],
  text: "Plainswalk (This creature can't be blocked as long as defending player controls a Plains.)\nWhenever this creature deals combat damage to a player, you may have target land become a Plains until this creature leaves the battlefield.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: ["land"],
      effect: {
        kind: "may",
        prompt: "Have the land become a Plains?",
        effect: { kind: "add-types", target: 0, setSubtypes: ["Plains"], duration: "while-source" },
      },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, you may have target land become a Plains until this creature leaves the battlefield.",
    },
  ],
});
