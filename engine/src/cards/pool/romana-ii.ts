import { defineCard } from "../define.js";

// Ghired, Mirror of the Wilds' copy, of any token (not only yours), tapped.
// The copy takes the token's copiable values — what the effect that made it
// said, or what it was copying (the rulings, rule 707.2).
const COPY_TEXT = "{1}, {T}: Create a tapped token that's a copy of target token that entered this turn.";

export default defineCard({
  name: "Romana II",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Scientist"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  pairing: { kind: "doctors-companion" },
  text: `Vigilance\n${COPY_TEXT}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "permanent", filter: { token: true, enteredThisTurn: true } }],
      effect: { kind: "create-token-copy", of: 0, count: 1, who: "you", tapped: true },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
