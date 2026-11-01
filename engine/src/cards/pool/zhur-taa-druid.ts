import { defineCard } from "../define.js";

const MANA = "{T}: Add {G}.";
const PING = "Whenever you tap this creature for mana, it deals 1 damage to each opponent.";

export default defineCard({
  name: "Zhur-Taa Druid",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 1,
  text: `${MANA}\n${PING}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: MANA,
    },
  ],
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: PING,
    },
  ],
});
