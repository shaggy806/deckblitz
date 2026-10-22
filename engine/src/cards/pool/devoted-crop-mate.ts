import { defineCard } from "../define.js";

// EDHREC rank 25572. Amonkhet. Glorybringer's exert; "when you do" is the
// exerted trigger, its graveyard target chosen as it goes on the stack — so
// it can be exerted with no legal target (the ruling). The returned creature
// wasn't declared an attacker. A card's {X} is 0 in the graveyard.
const EXERT_TEXT =
  "You may exert this creature as it attacks. When you do, return target creature card with mana value 2 or less from your graveyard to the battlefield.";

export default defineCard({
  name: "Devoted Crop-Mate",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  text: `${EXERT_TEXT} (An exerted creature won't untap during your next untap step.)`,
  static: [{ affects: { scope: "self" }, exertAsItAttacks: {}, text: EXERT_TEXT }],
  triggered: [
    {
      trigger: { on: "exerted", who: "self", asItAttacks: true },
      targets: [
        { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 2 } } },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: EXERT_TEXT,
    },
  ],
});
