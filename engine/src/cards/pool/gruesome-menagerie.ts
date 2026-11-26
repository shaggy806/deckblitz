import { defineCard } from "../define.js";

// EDHREC rank 21515.
//
// Queen Kayla bin-Kroog's one choice over the graveyard, a slot per mana
// value, all entering at once (the ruling), but not a "may": `min` is the
// slots' count, which the choice holds to the slots the graveyard can fill
// (`largestOneEach`), so a missing mana value is skipped (the ruling). Not
// targeted: chosen as it resolves. An {X} counts 0 off the stack (202.3e).
const creatureOf = (manaValue: number) => ({
  label: `a creature card with mana value ${manaValue}`,
  filter: { type: "creature", manaValue: { op: "eq", n: manaValue } } as const,
});
const SLOTS = [creatureOf(1), creatureOf(2), creatureOf(3)];

const TEXT =
  "Choose a creature card with mana value 1 in your graveyard, then do the same for creature cards with mana value 2 and 3. Return those cards to the battlefield.";

export default defineCard({
  name: "Gruesome Menagerie",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "look-and-choose",
    zone: "graveyard",
    min: 3,
    max: 3,
    filter: { anyOf: SLOTS.map((slot) => slot.filter) },
    together: {
      oneEach: SLOTS,
      text: "a creature card with each of mana values 1, 2 and 3",
    },
    destination: "battlefield",
    leftover: "stay",
  },
});
