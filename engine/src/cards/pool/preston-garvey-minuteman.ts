import { defineCard } from "../define.js";

// EDHREC rank 13032. No token with nothing there, or one it can't enchant (the
// rulings; `create-token`'s `attachedTo`).
const COMBAT_TEXT =
  "At the beginning of combat on your turn, create a green Aura enchantment token named Settlement attached to up to one target land you control. It has enchant land and \"Enchanted land has '{T}: Add one mana of any color.'\"";
const ATTACK_TEXT = "Whenever Preston Garvey attacks, untap each enchanted permanent you control.";

export default defineCard({
  name: "Preston Garvey, Minuteman",
  manaCost: "{2}{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 4,
  text: `${COMBAT_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "optional", of: "land-you-control" }],
      effect: { kind: "create-token", token: "Settlement Token", count: 1, attachedTo: 0 },
      resolve: null,
      text: COMBAT_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "untap-all", filter: { controlledBy: "you", enchanted: true } },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
