import { defineCard } from "../define.js";

// EDHREC rank 27194. Front face. The top card is exiled with this creature
// (`linked`, rule 607.2a) so "when you play a card exiled with this creature"
// (`plays-card`'s `exiledWithThis`) knows it; it transforms before the spell
// resolves (the ruling: a trigger on casting).

const ACTIVATED_TEXT =
  "{T}: This creature deals 2 damage to you. Exile the top card of your library. You may play that card this turn. Activate only as a sorcery.";
const PLAY_TEXT = "When you play a card exiled with this creature, transform this creature.";

export default defineCard({
  name: "Voltaic Visionary",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 1,
  text: `${ACTIVATED_TEXT}\n${PLAY_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, who: "you" },
          { kind: "impulse-exile", amount: 1, duration: "end-of-turn", play: true, linked: true },
        ],
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "plays-card", who: "you", exiledWithThis: true },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: PLAY_TEXT,
    },
  ],
  faces: ["Voltaic Visionary", "Volt-Charged Berserker"],
  transform: true,
});
