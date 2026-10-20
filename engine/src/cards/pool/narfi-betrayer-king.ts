import { defineCard } from "../define.js";

// EDHREC rank 11887.
//
// "Snow and Zombie creatures": each creature that's either — a snow Zombie
// gets +1/+1 once (the ruling). The return is Drownyard Temple's, paid in
// snow mana (rule 107.4h).
const ANTHEM_TEXT = "Other snow and Zombie creatures you control get +1/+1.";
const RETURN_TEXT = "{S}{S}{S}: Return this card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Narfi, Betrayer King",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary", "snow"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 4,
  toughness: 3,
  text: `${ANTHEM_TEXT}\n${RETURN_TEXT} ({S} can be paid with one mana from a snow source.)`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", anyOf: [{ supertype: "snow" }, { subtype: "Zombie" }] },
        excludeSelf: true,
      },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{S}{S}{S}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
