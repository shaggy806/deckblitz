import { defineCard } from "../define.js";

// The three cards return at once (one event, `simultaneous`), each a 5/5
// Elemental creature in addition to its other types from the moment it
// enters (`enterAs`): its base P/T is 5/5 (layer 7b) and it keeps its own
// types, so a land is a 5/5 Elemental creature land that still taps for
// mana. An Equipment that becomes a creature this way can't equip anything.
const ENTER_AS = { addTypes: ["creature"], addSubtypes: ["Elemental"], basePt: [5, 5] } as const;

export default defineCard({
  name: "Relive the Past",
  manaCost: "{5}{G}{W}",
  colors: ["G", "W"],
  types: ["sorcery"],
  text:
    "Return up to one target artifact card, up to one target land card, and up to one target non-Aura enchantment card from your graveyard to the battlefield. They are 5/5 Elemental creatures in addition to their other types.",
  targets: [
    { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } } },
    { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "land" } } },
    {
      kind: "optional",
      of: { kind: "card-in-graveyard", whose: "you", filter: { type: "enchantment", notSubtypes: ["Aura"] } },
    },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "put-onto-battlefield", target: 0, enterAs: ENTER_AS },
      { kind: "put-onto-battlefield", target: 1, enterAs: ENTER_AS },
      { kind: "put-onto-battlefield", target: 2, enterAs: ENTER_AS },
    ],
  },
});
