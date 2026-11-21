import { defineCard } from "../define.js";

// EDHREC rank 17950.
//
// "Its emerge cost was paid" is the permanent's entry having been cast with
// emerge (`castVia`); "the sacrificed creature" is the one its spell's emerge
// cost took (`enteredPaid`, rule 702.119a), read as it last existed on the
// battlefield (the ruling).

const TEXT =
  "When this creature enters, create a 2/2 white Alien creature token. If this creature's emerge cost was paid, instead create X of those tokens, where X is the sacrificed creature's toughness.";

export default defineCard({
  name: "Adipose Offspring",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Alien"],
  power: 2,
  toughness: 2,
  emerge: { cost: "{5}{W}" },
  text: `Emerge {5}{W} (You may cast this spell by sacrificing a creature and paying the emerge cost reduced by that creature's mana value.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Alien Token (Adipose Offspring)",
        count: {
          ifCondition: { kind: "source", filter: { castVia: "emerge" } },
          then: { toughnessOf: { paid: "sacrificed" } },
          else: 1,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
