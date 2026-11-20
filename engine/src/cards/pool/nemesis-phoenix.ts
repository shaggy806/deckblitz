import { defineCard } from "../define.js";

// EDHREC rank 17968. "You're attacking two or more opponents" counts the
// players being attacked, not their planeswalkers (rule 802.4 tells the two
// apart): `attacking-opponents`. Checked as it's activated (602.5b); once on
// the stack it resolves whatever has changed. It enters attacking a player or
// planeswalker its controller chooses (508.4), though it never "attacked".
const RETURN_TEXT =
  "{2}{R}: Return this card from your graveyard to the battlefield tapped and attacking. Activate only during the declare attackers step and only if you're attacking two or more opponents.";

export default defineCard({
  name: "Nemesis Phoenix",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 4,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      condition: {
        kind: "all",
        of: [
          { kind: "turn-structure", steps: ["declare-attackers"] },
          { kind: "attacking-opponents", atLeast: 2 },
        ],
      },
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true, attacking: "choose" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
