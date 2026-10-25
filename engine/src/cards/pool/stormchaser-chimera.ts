import { defineCard } from "../define.js";

const TEXT =
  "{2}{U}{R}: Scry 1, then reveal the top card of your library. This creature gets +X/+0 until end of turn, where X is that card's mana value.";

export default defineCard({
  name: "Stormchaser Chimera",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Chimera"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT} (To scry 1, look at the top card of your library, then you may put that card on the bottom.)`,
  activated: [
    {
      cost: { mana: "{2}{U}{R}", tap: false },
      targets: [],
      effect: {
        kind: "scry",
        amount: 1,
        then: {
          kind: "reveal-top",
          then: {
            kind: "modify-pt",
            target: "source",
            power: { manaValueOf: 0 },
            toughness: 0,
            duration: "end-of-turn",
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
