import { defineCard } from "../define.js";

// EDHREC rank 15609.
//
// Rulings (suspend, 2024-02-02, abridged):
//   - If the spell requires any targets, those targets are chosen when the spell is finally
//     cast, not when it's exiled.
//   - As the second triggered ability resolves, you may cast the card. If you don't, it remains
//     exiled with no time counters on it, and it's no longer suspended.
const ENTERS_TEXT = "When this creature enters, exile up to one target tapped creature.";

export default defineCard({
  name: "Atraxi Warden",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Alien", "Eye"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  suspend: { n: 5, cost: "{1}{W}" },
  text: `Flying\n${ENTERS_TEXT}\nSuspend 5—{1}{W} (Rather than cast this card from your hand, you may pay {1}{W} and exile it with five time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { type: "creature", tapped: true } } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
