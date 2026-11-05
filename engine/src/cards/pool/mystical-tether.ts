import { defineCard } from "../define.js";

// Flash for {2} more (`kicker`'s `keyword: "flash"`). Gone before its
// trigger resolves, it exiles nothing (rule 610.3c — the ruling).

const ENTER_TEXT =
  "When this enchantment enters, exile target artifact or creature an opponent controls until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Mystical Tether",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  kicker: { cost: "{2}", keyword: "flash", flash: true },
  text: `You may cast this spell as though it had flash if you pay {2} more to cast it.\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
