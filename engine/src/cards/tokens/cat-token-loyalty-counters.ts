import { defineCard } from "../define.js";

// A 1/1 white Cat creature token with "{T}: Put a loyalty counter on each
// planeswalker you control." (Worzel, the Protector). No token printing in the
// Oracle snapshot.
const TAP = "{T}: Put a loyalty counter on each planeswalker you control.";

export default defineCard({
  name: "Cat Token (Loyalty Counters)",
  tokenName: "Cat",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 1,
  toughness: 1,
  text: TAP,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "planeswalker", controlledBy: "you" },
        counter: "loyalty",
        amount: 1,
      },
      resolve: null,
      text: TAP,
    },
  ],
});
