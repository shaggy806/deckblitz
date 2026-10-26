import { defineCard } from "../define.js";

// Rulings:
//   [2007-10-01] Once the ability has resolved, all damage that would be dealt to that creature
//     for the rest of the turn will be prevented, regardless of whether it’s tapped or untapped at
//     the time that damage would be dealt.
//   [2007-10-01] The targeted creature must be tapped when the ability is activated and when it
//     resolves. It doesn’t need to remain tapped in between.

export default defineCard({
  name: "Wellgabber Apothecary",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Merfolk", "Cleric"],
  power: 2,
  toughness: 3,
  text: "{1}{W}: Prevent all damage that would be dealt to target tapped Merfolk or Kithkin creature this turn.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", tapped: true, subtypes: ["Merfolk", "Kithkin"] } }],
      effect: { kind: "prevent-damage", target: 0, amount: "all" },
      resolve: null,
      text: "{1}{W}: Prevent all damage that would be dealt to target tapped Merfolk or Kithkin creature this turn.",
    },
  ],
});
