import { defineCard } from "../define.js";

// Commander Legends.
//
// - "A player losing unspent mana causes that player to lose that much life": a property of the
//   game while it's on the battlefield (`manaLossCausesLifeLoss`) — as each step and phase ends,
//   every player loses 1 life for each mana emptied from their pool (not damage; no mana a keep or
//   a "becomes colorless" replacement saved).
// - "{1}, {T}: Each player adds {B}{R}{G}.": a mana ability (rule 605.1a), its controller's own
//   mana unscoped and the others' on `also` with `who: "each-opponent"`.

const LOSS_TEXT = "A player losing unspent mana causes that player to lose that much life.";
const MANA_TEXT = "{1}, {T}: Each player adds {B}{R}{G}.";

export default defineCard({
  name: "Yurlok of Scorch Thrash",
  manaCost: "{1}{B}{R}{G}",
  colors: ["B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Lizard", "Shaman"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${LOSS_TEXT}\n${MANA_TEXT}`,
  static: [{ affects: { scope: "self" }, manaLossCausesLifeLoss: true, text: LOSS_TEXT }],
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { all: ["B", "R", "G"] },
        amount: 1,
        also: { kind: "add-mana", mana: { all: ["B", "R", "G"] }, amount: 1, who: "each-opponent" },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
