import { defineCard } from "../define.js";

// Devotion is counted as the spell is cast and only the generic part goes
// (the rulings): `{ devotionTo }` as a self cost reduction.
export default defineCard({
  name: "Daybreak Chimera",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Chimera"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { devotionTo: ["W"] },
  },
  text: "This spell costs {X} less to cast, where X is your devotion to white. (Each {W} in the mana costs of permanents you control counts toward your devotion to white.)\nFlying",
});
