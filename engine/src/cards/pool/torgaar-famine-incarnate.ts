import { defineCard } from "../define.js";

// Any number may be sacrificed, past what still lowers the cost, which never
// goes below {B}{B} (the rulings — `sacrificeReduces`). The new life total is
// a real gain or loss of the difference (rule 119.5).

const ENTER_TEXT =
  "When Torgaar enters, up to one target player's life total becomes half their starting life total, rounded down.";

export default defineCard({
  name: "Torgaar, Famine Incarnate",
  manaCost: "{6}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 7,
  toughness: 6,
  additionalCost: { sacrifice: { type: "creature" }, sacrificeCount: "x", sacrificeReduces: 2 },
  text: `As an additional cost to cast this spell, you may sacrifice any number of creatures. This spell costs {2} less to cast for each creature sacrificed this way.\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "player" }],
      effect: {
        kind: "set-life-total",
        who: 0,
        amount: { half: { startingLifeTotal: true }, round: "down" },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
