import { defineCard } from "../define.js";

const GAIN = "{1}, Sacrifice another creature: You gain life equal to the sacrificed creature's toughness.";
const EXILE =
  "{1}{W}{B}, Sacrifice another creature: Exile target nonland permanent. Activate only if you have at least 10 life more than your starting life total.";

export default defineCard({
  name: "Ayli, Eternal Pilgrim",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kor", "Cleric"],
  power: 2,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)\n${GAIN}\n${EXILE}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      otherOnly: true,
      targets: [],
      effect: { kind: "gain-life", amount: { toughnessOf: { paid: "sacrificed" } } },
      resolve: null,
      text: GAIN,
    },
    {
      cost: { mana: "{1}{W}{B}", tap: false, sacrifice: "creature-you-control" },
      otherOnly: true,
      condition: { kind: "life-total", atLeast: { startingPlus: 10 } },
      targets: ["nonland-permanent"],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: EXILE,
    },
  ],
});
