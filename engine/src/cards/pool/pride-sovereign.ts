import { defineCard } from "../define.js";

// Amonkhet. Exert as an activation cost (rule 701.43): it may be exerted again
// even if exerted earlier this turn (the ruling).
const ANTHEM = "This creature gets +1/+1 for each other Cat you control.";
const MAKE =
  "{W}, {T}, Exert this creature: Create two 1/1 white Cat creature tokens with lifelink.";

export default defineCard({
  name: "Pride Sovereign",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 2,
  toughness: 2,
  text: `${ANTHEM}\n${MAKE} (An exerted creature won't untap during your next untap step.)`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Cat", controlledBy: "you" }, pt: [1, 1], excludeSelf: true },
      text: ANTHEM,
    },
  ],
  activated: [
    {
      cost: { mana: "{W}", tap: true, exertSelf: true },
      targets: [],
      effect: { kind: "create-token", token: "Lifelink Cat Token", count: 2 },
      resolve: null,
      text: MAKE,
    },
  ],
});
