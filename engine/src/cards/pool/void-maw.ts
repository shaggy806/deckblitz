import { defineCard } from "../define.js";

// EDHREC rank 22546. Time Spiral. The replacement exiles each other dying
// creature linked to Void Maw (rule 607.2b, `linked`), so its cost's
// `putFromExile { linked }` finds the cards exiled with it — only this stint's.
const REPLACE = "If another creature would die, exile it instead.";
const PUMP = "Put a card exiled with this creature into its owner's graveyard: This creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Void Maw",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 4,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${REPLACE}\n${PUMP}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        from: "battlefield",
        filter: { type: "creature", isSource: false },
        linked: true,
      },
      text: REPLACE,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, putFromExile: { count: 1, linked: true } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: PUMP,
    },
  ],
});
