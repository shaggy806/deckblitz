import { defineCard } from "../define.js";

const BLOCK_TEXT = "This creature can't be blocked except by three or more creatures.";
const RETURN_TEXT =
  "{8}: Return this card from your graveyard to the battlefield tapped with a finality counter on it. (If a creature with a finality counter on it would die, exile it instead.)";

export default defineCard({
  name: "Relentless X-ATM092",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Spider"],
  power: 6,
  toughness: 5,
  text: `${BLOCK_TEXT}\n${RETURN_TEXT}`,
  static: [{ affects: { scope: "self" }, blockedByAtLeast: 3, text: BLOCK_TEXT }],
  activated: [
    {
      cost: { mana: "{8}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "source",
        enterTapped: true,
        withCounters: { kind: "finality", amount: 1 },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
