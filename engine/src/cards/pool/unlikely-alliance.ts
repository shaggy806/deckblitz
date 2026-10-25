import { defineCard } from "../define.js";

// EDHREC rank 31372. Alliances. The bonus stays if the creature later
// attacks or blocks (the ruling): only the target's legality is checked.

export default defineCard({
  name: "Unlikely Alliance",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "{1}{W}: Target nonattacking, nonblocking creature gets +0/+2 until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: false, blocking: false } }],
      effect: { kind: "modify-pt", target: 0, power: 0, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{W}: Target nonattacking, nonblocking creature gets +0/+2 until end of turn.",
    },
  ],
});
