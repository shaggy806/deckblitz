import { defineCard } from "../define.js";

// EDHREC rank 8088.
//
// Rulings:
//   [2022-09-09] Exiling Valiant Veteran from your graveyard is part of the cost to activate its
//     last ability. This means that once it has been activated it is no longer in the graveyard,
//     and players can't respond to it by removing it from your graveyard to prevent you from
//     activating it.
//
// A graveyard ability without `staysInZone` exiles its card as the cost.
// "Each Soldier you control" is any permanent with the subtype, as it resolves.
const ANTHEM_TEXT = "Other Soldiers you control get +1/+1.";
const GRAVE_TEXT =
  "{3}{W}{W}, Exile this card from your graveyard: Put a +1/+1 counter on each Soldier you control.";

export default defineCard({
  name: "Valiant Veteran",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Soldier"],
  power: 2,
  toughness: 2,
  text: `${ANTHEM_TEXT}\n${GRAVE_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Soldier", controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{W}{W}", tap: false },
      zone: "graveyard",
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { subtype: "Soldier", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: GRAVE_TEXT,
    },
  ],
});
