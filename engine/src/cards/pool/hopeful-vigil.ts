import { defineCard } from "../define.js";

const ENTERS = "When this enchantment enters, create a 2/2 white Knight creature token with vigilance.";
const GRAVEYARD = "When this enchantment is put into a graveyard from the battlefield, scry 2.";
const SACRIFICE = "{2}{W}: Sacrifice this enchantment.";

export default defineCard({
  name: "Hopeful Vigil",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTERS}\n${GRAVEYARD}\n${SACRIFICE}`,
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SACRIFICE,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Knight Token", count: 1 },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: GRAVEYARD,
    },
  ],
});
