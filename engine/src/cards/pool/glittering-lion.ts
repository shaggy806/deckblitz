import { defineCard } from "../define.js";

// EDHREC rank 27570.
//
// The activated ability takes away the one static by its text (layer 6,
// `loseStatics`), so the damage dealt to it that turn isn't prevented; any
// player may activate it (rule 602.2) and pays for it.
const PREVENT = "Prevent all damage that would be dealt to this creature.";
const LOSE = `{3}: Until end of turn, this creature loses "${PREVENT}" Any player may activate this ability.`;

export default defineCard({
  name: "Glittering Lion",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 2,
  toughness: 2,
  text: `${PREVENT}\n${LOSE}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", instead: { prevent: true }, to: "self" },
      text: PREVENT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      anyPlayer: true,
      targets: [],
      effect: { kind: "become", target: "source", loseStatics: [PREVENT], duration: "end-of-turn" },
      resolve: null,
      text: LOSE,
    },
  ],
});
