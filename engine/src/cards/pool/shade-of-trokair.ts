import { defineCard } from "../define.js";

export default defineCard({
  name: "Shade of Trokair",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Shade"],
  power: 1,
  toughness: 2,
  suspend: { n: 3, cost: "{W}" },
  text: "{W}: This creature gets +1/+1 until end of turn.\nSuspend 3—{W} (Rather than cast this card from your hand, you may pay {W} and exile it with three time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{W}: This creature gets +1/+1 until end of turn.",
    },
  ],
});
