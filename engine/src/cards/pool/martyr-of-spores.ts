import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 29334. Martyr of Sands' "Reveal X [colour]
// cards from your hand" cost (`reveal`), X read by the pump.

const TEXT = "{1}, Reveal X green cards from your hand, Sacrifice this creature: Target creature gets +X/+X until end of turn.";

export default defineCard({
  name: "Martyr of Spores",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self", reveal: { count: "x", filter: { colors: ["G"] }, text: "green cards" } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: "x", toughness: "x", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
