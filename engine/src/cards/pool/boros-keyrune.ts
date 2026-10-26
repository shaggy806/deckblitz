import { defineCard } from "../define.js";

// EDHREC rank 15248. Dimir Keyrune's shape with Needle Spires' colours and
// double strike.
//
// Rulings:
//   [2013-04-15] Until the ability that turns the Keyrune into a creature resolves, the Keyrune is
//     colorless.
//   [2013-04-15] Activating the ability that turns the Keyrune into a creature while it's already
//     a creature will override any effects that set its power and/or toughness to another number,
//     but effects that modify power and/or toughness without directly setting them will still
//     apply.

const ANIMATE_TEXT =
  "{R}{W}: This artifact becomes a 1/1 red and white Soldier artifact creature with double strike until end of turn.";

export default defineCard({
  name: "Boros Keyrune",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Add {R} or {W}.\n${ANIMATE_TEXT} (It deals both first-strike and regular combat damage.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["R", "W"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {R} or {W}.",
    },
    {
      cost: { mana: "{R}{W}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 1,
        toughness: 1,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Soldier"],
        setColors: ["R", "W"],
        keywords: ["double-strike"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
