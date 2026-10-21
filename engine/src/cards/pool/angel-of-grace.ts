import { defineCard } from "../define.js";

// Ravnica Allegiance. The enters trigger is Angel's Grace's life floor: it
// changes only what damage does to the life total, so lifelink still gains,
// commander damage is still tracked, life loss isn't stopped, and a life total
// already below 1 drops as normal (the rulings — `lifeLossFromDamage`).
// "Your life total becomes 10" is gaining or losing the difference (rule
// 119.5 — the ruling; Loxodon Lifechanter's shape).
const ENTER_TEXT =
  "When this creature enters, until end of turn, damage that would reduce your life total to less than 1 reduces it to 1 instead.";
const GRAVEYARD_TEXT = "{4}{W}{W}, Exile this card from your graveyard: Your life total becomes 10.";
const LIFE = { lifeTotal: "you" } as const;

export default defineCard({
  name: "Angel of Grace",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 4,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${ENTER_TEXT}\n${GRAVEYARD_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}{W}{W}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "life-total", atMost: 9 },
        then: { kind: "gain-life", amount: { difference: [10, LIFE] } },
        else: {
          kind: "conditional",
          condition: { kind: "life-total", atLeast: 11 },
          then: { kind: "lose-life", amount: { difference: [LIFE, 10] } },
        },
      },
      resolve: null,
      text: GRAVEYARD_TEXT,
      zone: "graveyard",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "player-effect", duration: "end-of-turn", damageLifeFloor: { who: "you", floor: 1 } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
