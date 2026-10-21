import { defineCard } from "../define.js";

const HEXPROOF_TEXT = "You have hexproof. (You can't be the target of spells or abilities your opponents control.)";
const WALL_TEXT = "−2: Create a 0/3 white Wall creature token with defender.";

export default defineCard({
  name: "Teyo, the Shieldmage",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Teyo"],
  loyalty: 5,
  text: `${HEXPROOF_TEXT}\n${WALL_TEXT}`,
  static: [{ affects: { scope: "self" }, playerHexproof: true, text: HEXPROOF_TEXT }],
  activated: [
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      // The 0/3 white Wall with defender (Rammas Echor's token is the same one).
      effect: { kind: "create-token", token: "Wall Token (Rammas Echor, Ancient Shield)", count: 1 },
      resolve: null,
      text: WALL_TEXT,
    },
  ],
});
