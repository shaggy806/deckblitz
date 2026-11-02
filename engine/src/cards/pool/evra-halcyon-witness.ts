import { defineCard } from "../define.js";

// Rulings:
//   Any power-modifying effects, counters, Auras, or Equipment will apply after Evra's power is
//   set to your former life total.
//   If Evra isn't on the battlefield when its activated ability resolves, the exchange can't
//   happen and the ability will have no effect. However, if Evra is on the battlefield but has
//   power 0 or less, the exchange happens and you'll lose the game.

const TEXT = "{4}: Exchange your life total with Evra's power.";

export default defineCard({
  name: "Evra, Halcyon Witness",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 4,
  toughness: 4,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      effect: { kind: "exchange-life-stat", stat: "power", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
