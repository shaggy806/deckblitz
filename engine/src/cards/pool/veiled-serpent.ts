import { defineCard } from "../define.js";

// Opal Gargoyle's shape: an intervening-if (rule 603.4) and `setTypes`, so it's
// no longer an enchantment, with the can't-attack granted beside it.
const ATTACK = "This creature can't attack unless defending player controls an Island.";
const TEXT = `When an opponent casts a spell, if this permanent is an enchantment, it becomes a 4/4 Serpent creature with "${ATTACK}"`;

export default defineCard({
  name: "Veiled Serpent",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${TEXT}\nCycling {2} ({2}, Discard this card: Draw a card.)`,
  cycling: { cost: "{2}" },
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent" },
      condition: { kind: "source", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            power: 4,
            toughness: 4,
            setTypes: ["creature"],
            addTypes: [],
            addSubtypes: [],
            setSubtypes: ["Serpent"],
            duration: "permanent",
          },
          {
            kind: "grant-static",
            target: "source",
            ability: { affects: { scope: "self" }, restrictions: [{ kind: "cant-attack", unlessDefender: { controls: { subtype: "Island" } } }], text: ATTACK },
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
