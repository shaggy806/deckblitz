import { defineCard } from "../define.js";

// Zendikar Rising (ZNR). EDHREC rank 22483. With no target chosen, no one
// mills: the mill reads "its controller" from the empty slot.

const ETB =
  "When this creature enters, up to one target creature gets -2/-0 until end of turn. Its controller mills two cards.";

export default defineCard({
  name: "Zulaport Duelist",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["flash"],
  text: "Flash\nWhen this creature enters, up to one target creature gets -2/-0 until end of turn. Its controller mills two cards. (They put the top two cards of their library into their graveyard.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: -2, toughness: 0, duration: "end-of-turn" },
          { kind: "mill", target: 0, amount: 2 },
        ],
      },
      resolve: null,
      text: ETB,
    },
  ],
});
