import { defineCard } from "../define.js";

const TAX_TEXT =
  "Creatures can't attack planeswalkers you control unless their controller pays {1} for each creature they control that's attacking a planeswalker you control.";
const RETURN_TEXT =
  "{4}{W}{W}, Exile this card from your graveyard: Return target planeswalker card from your graveyard to the battlefield.";

export default defineCard({
  name: "Onakke Oathkeeper",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Ogre", "Spirit"],
  power: 0,
  toughness: 4,
  text: `${TAX_TEXT}\n${RETURN_TEXT}`,
  static: [{ affects: { scope: "self" }, attackTax: { generic: 1, covers: "planeswalkers" }, text: TAX_TEXT }],
  activated: [
    {
      cost: { mana: "{4}{W}{W}", tap: false },
      zone: "graveyard",
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "planeswalker" } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
