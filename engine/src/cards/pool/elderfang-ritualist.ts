import { defineCard } from "../define.js";

// EDHREC rank 14274. Kaldheim. Morcant's Loyalist's dies trigger.

const TEXT = "When this creature dies, return another target Elf card from your graveyard to your hand.";

export default defineCard({
  name: "Elderfang Ritualist",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Cleric"],
  power: 3,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "other", of: { kind: "card-in-graveyard", whose: "you", filter: { subtype: "Elf" } } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
