import { defineCard } from "../define.js";

const TEXT = "Whenever you activate an ability of an Elemental, this creature gets +1/+0 until end of turn.";

// `activates-ability`'s `orMana` (B278): an Elemental's mana ability counts
// too. Only an Elemental permanent's, not a card's elsewhere (its ruling).
export default defineCard({
  name: "Ceaseless Searblades",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Warrior"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "activates-ability", who: "you", source: { subtype: "Elemental" }, orMana: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
