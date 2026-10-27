import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 20159. Karn, Silver Golem's ability
// as a Spellshaper's. A just-animated artifact attacks or taps only if its
// controller has controlled it since their turn began (its ruling).

const TEXT =
  "{1}, {T}, Discard a card: Target noncreature artifact becomes an artifact creature with power and toughness each equal to its mana value until end of turn. (It retains its abilities.)";

export default defineCard({
  name: "Toymaker",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true, discard: { count: 1 } },
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
      text: TEXT,
    },
  ],
});
