import { defineCard } from "../define.js";

const POWER_UP_TEXT =
  "Power-up — {C}{W}{U}{B}{R}{G}: Put two +1/+1 counters on Thanos. Choose odd or even. Destroy each other creature with mana value of the chosen quality.";

export default defineCard({
  name: "Thanos, the Mad Titan",
  manaCost: "{R}{W}{B}",
  colors: ["R", "W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Eternal", "Villain"],
  power: 4,
  toughness: 4,
  keywords: ["deathtouch", "lifelink"],
  text: `Deathtouch, lifelink\n${POWER_UP_TEXT} (Activate each power-up ability only once. Reduce the cost by his mana cost if he entered this turn. Zero is even.)`,
  activated: [
    {
      cost: { mana: "{C}{W}{U}{B}{R}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
          {
            kind: "choose-creature-type",
            options: ["odd", "even"],
            prompt: "Choose odd or even",
            then: {
              kind: "destroy-all",
              filter: { type: "creature", manaValueParity: "$chosen" },
              exceptSource: true,
            },
          },
        ],
      },
      resolve: null,
      text: POWER_UP_TEXT,
      powerUp: true,
    },
  ],
});
