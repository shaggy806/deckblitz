import { defineCard } from "../define.js";

// EDHREC rank 29210.
//
// Rulings:
//   [2005-10-01] Replacement effects that don’t use the word “prevent” can replace Excruciator’s
//     damage with something else. See Phytohydra and Szadek, Lord of Secrets, for example.
//   [2005-10-01] An effect may redirect Excruciator’s damage.
//   [2005-10-01] Excruciator can deal damage to creatures with protection from red. (It can’t
//     block creatures with protection from red, though.)
//   [2005-10-01] A creature dealt lethal damage by Excruciator can be regenerated.
//   [2005-10-01] Damage prevention shields that would prevent this damage aren’t used up and they
//     stick around for the next time something would deal damage.

export default defineCard({
  name: "Excruciator",
  manaCost: "{6}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 7,
  toughness: 7,
  text: "Damage that would be dealt by this creature can't be prevented.",
  static: [
    {
      affects: { scope: "self" },
      damageCantBePrevented: { fromSelf: true },
      text: "Damage that would be dealt by this creature can't be prevented.",
    },
  ],
});
