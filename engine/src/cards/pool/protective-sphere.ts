import { defineCard } from "../define.js";

// EDHREC rank 25994. "A source of your choice that shares a color with the
// mana spent on this activation cost": the colors of the mana that paid its
// {1} (rule 602.2b), bound as it resolves (`sharesColorWithMana: "spent"`) —
// colorless mana is no color (rule 105.2c), so with it there's no source to
// choose and nothing happens. The source is chosen as it resolves (609.7a),
// and the shield rechecks that it still shares a color as the damage would be
// dealt (609.7b). The Oracle text says "all damage … this turn", which the
// older ruling's "the next damage" predates.
//
// Rulings:
//   [2004-10-04] A source of damage is a permanent, a spell on the stack (including one that creates
//     a permanent), or any object referred to by an object on the stack. A source doesn't need to
//     be capable of dealing damage to be a legal choice.

const TEXT =
  "{1}, Pay 1 life: Prevent all damage that would be dealt to you this turn by a source of your choice that shares a color with the mana spent on this activation cost. (Colorless mana prevents no damage.)";

export default defineCard({
  name: "Protective Sphere",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, payLife: 1 },
      targets: [],
      effect: {
        kind: "prevent-damage-from-chosen-source",
        filter: { sharesColorWithMana: "spent" },
        to: "you",
        amount: "all",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
