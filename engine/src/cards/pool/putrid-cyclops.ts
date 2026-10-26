import { defineCard } from "../define.js";

// Future Sight (FUT). EDHREC rank 31939.
//
// Stormchaser Chimera's scry-then-reveal shape, the mana value negated.

const TEXT =
  "When this creature enters, scry 1, then reveal the top card of your library. This creature gets -X/-X until end of turn, where X is that card's mana value.";
const MINUS_X = { product: [{ manaValueOf: 0 }, -1] } as const;

export default defineCard({
  name: "Putrid Cyclops",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Cyclops"],
  power: 3,
  toughness: 3,
  text: `${TEXT} (To scry 1, look at the top card of your library, then you may put that card on the bottom.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "scry",
        amount: 1,
        then: {
          kind: "reveal-top",
          then: { kind: "modify-pt", target: "source", power: MINUS_X, toughness: MINUS_X, duration: "end-of-turn" },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
