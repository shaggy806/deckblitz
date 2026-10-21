import { defineCard } from "../define.js";

// The Gitrog Monster's batched trigger: lands put into your graveyard at once
// trigger it only once (the ruling). Any three creatures pay the cost — this
// one among them, since the cost doesn't say "other".
const PLANT_TEXT =
  "Whenever one or more land cards are put into your graveyard from anywhere, create a 0/1 green Plant creature token.";
const RETURN_TEXT = "{G}, Sacrifice three creatures: Return target land card from your graveyard to your hand.";

export default defineCard({
  name: "Turntimber Sower",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 3,
  toughness: 3,
  text: `${PLANT_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "you", filter: { type: "land" }, batched: true },
      targets: [],
      effect: { kind: "create-token", token: "Plant Token", count: 1 },
      resolve: null,
      text: PLANT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{G}", tap: false, sacrifice: { filter: { type: "creature" }, count: 3 } },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "land" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
