import { defineCard } from "../define.js";
import { entersPrepared } from "../helpers.js";

// A preparation card (rule 722): its prepare spell is Enroot.
const COMBAT_TEXT =
  "Whenever this creature deals combat damage to a player, return target land card from your graveyard to your hand.";

export default defineCard({
  name: "Carnivorous Cultivator",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warlock"],
  power: 2,
  toughness: 3,
  keywords: ["deathtouch"],
  prepareSpell: "Enroot",
  text: `Deathtouch\nThis creature enters prepared.\n${COMBAT_TEXT}`,
  static: [entersPrepared()],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "land" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
