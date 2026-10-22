import { defineCard } from "../define.js";

// EDHREC rank 8055. Amonkhet. A static's `controls` condition leaves its own
// permanent out, so "three other creatures" is atLeast 3 without
// `countsSelf` (Bast, Panther Goddess counts itself). Once Oketra has
// attacked or blocked it stays in combat (the ruling): the restriction is
// checked only as attackers and blockers are declared.

const RESTRICT_TEXT = "Oketra can't attack or block unless you control at least three other creatures.";
const TOKEN_TEXT = "{3}{W}: Create a 1/1 white Warrior creature token with vigilance.";

export default defineCard({
  name: "Oketra the True",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God"],
  power: 3,
  toughness: 6,
  keywords: ["double-strike", "indestructible"],
  text: `Double strike, indestructible\n${RESTRICT_TEXT}\n${TOKEN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "controls", filter: { type: "creature" }, atLeast: 3 } },
      restrictions: ["cant-attack", "cant-block"],
      text: RESTRICT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Warrior Token (Vigilance)", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
});
