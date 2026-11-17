import { defineCard } from "../define.js";

// The front face of Arcee, Sharpshooter // Arcee, Acrobatic Coupe.
//
// "Remove one or more +1/+1 counters" is X counters with X at least 1 (`minX: 1`); "that much
// damage" is X. The ability converts Arcee as it resolves (`transform` on the source).

const SHOOT_TEXT =
  "{1}, Remove one or more +1/+1 counters from Arcee: It deals that much damage to target creature. Convert Arcee.";

export default defineCard({
  name: "Arcee, Sharpshooter",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "More Than Meets the Eye {R}{W} (You may cast this card converted for {R}{W}.)\nFirst strike\n" + SHOOT_TEXT,
  faces: ["Arcee, Sharpshooter", "Arcee, Acrobatic Coupe"],
  transform: true,
  moreThanMeetsTheEye: { cost: "{R}{W}" },
  activated: [
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "+1/+1", count: "x" } },
      minX: 1,
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: "x", target: 0 },
          { kind: "transform", target: "source" },
        ],
      },
      resolve: null,
      text: SHOOT_TEXT,
    },
  ],
});
