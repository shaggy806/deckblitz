import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 11898. One ability over two events, as
// Brushwagg's is: a creature never both blocks and becomes blocked in one
// combat, and "becomes blocked" fires once however many blockers (the ruling).

const BLOCK_TEXT = "Whenever Karn blocks or becomes blocked, it gets -4/+4 until end of turn.";
const SHIFT = { kind: "modify-pt", target: "source", power: -4, toughness: 4, duration: "end-of-turn" } as const;
const ANIMATE_TEXT =
  "{1}: Target noncreature artifact becomes an artifact creature with power and toughness each equal to its mana value until end of turn.";

export default defineCard({
  name: "Karn, Silver Golem",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 4,
  toughness: 4,
  text: `${BLOCK_TEXT}\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "artifact", notTypes: ["creature"] } }],
      effect: {
        kind: "animate",
        target: 0,
        power: { manaValueOf: 0 },
        toughness: { manaValueOf: 0 },
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
  triggered: [
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: SHIFT, resolve: null, text: BLOCK_TEXT },
    { trigger: { on: "becomes-blocked", who: "self" }, targets: [], effect: SHIFT, resolve: null, text: BLOCK_TEXT },
  ],
});
