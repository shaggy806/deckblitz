import { defineCard } from "../define.js";

const VETERAN_TEXT =
  "{1}, Sacrifice this creature: Create a Young Hero Role token attached to another target creature.";

export default defineCard({
  name: "Embereth Veteran",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 1,
  text: `${VETERAN_TEXT} (If you control another Role on it, put that one into the graveyard. Enchanted creature has "Whenever this creature attacks, if its toughness is 3 or less, put a +1/+1 counter on it.")`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "create-token", token: "Young Hero Role Token", count: 1, attachedTo: 0 },
      resolve: null,
      text: VETERAN_TEXT,
    },
  ],
});
