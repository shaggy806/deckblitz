import { defineCard } from "../define.js";

// EDHREC rank 17585.
//
// Lands become Plains (rule 305.7: their other land types and abilities go,
// "{T}: Add {W}" comes); only on the battlefield (the rulings). Nonland
// permanents, spells and nonland cards off the battlefield are white, the
// last two through `outsideBattlefield` (rule 604.1). The mana line is a
// restriction on how its controller pays (rules 118.14, 609.4b): white pays
// any coloured pip, and every other type only generic and {C}
// (`othersOnlyAsColorless`), even beside a permission to spend it as a
// colour (rule 101.2). Mana made by nonland permanents is still its own
// colour (the ruling).

const LANDS = "Lands you control are Plains.";
const WHITE =
  "Nonland permanents you control are white. The same is true for spells you control and nonland cards you own that aren't on the battlefield.";
const MANA =
  "You may spend white mana as though it were mana of any color. You may spend other mana only as though it were colorless mana.";

export default defineCard({
  name: "Celestial Dawn",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${LANDS}\n${WHITE}\n${MANA}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "land", controlledBy: "you" } },
      setSubtypes: ["Plains"],
      text: LANDS,
    },
    {
      affects: { scope: "filter", filter: { controlledBy: "you", notTypes: ["land"] } },
      setColors: ["W"],
      outsideBattlefield: { notType: "land", setColors: ["W"] },
      text: WHITE,
    },
    {
      affects: { scope: "self" },
      spendManaAs: { as: { unit: "W", as: "any-color" }, othersOnlyAsColorless: true },
      text: MANA,
    },
  ],
});
