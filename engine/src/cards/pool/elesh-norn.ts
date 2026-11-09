import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// One trigger per recipient, as Flameblade Angel's (its rulings: a source hitting
// you and two creatures triggers it three times). "That source's controller" is
// the `"trigger-controller"`.
const TAX_TEXT =
  "Whenever a source an opponent controls deals damage to you or a permanent you control, that source's controller loses 2 life unless they pay {1}.";
const TRANSFORM_TEXT =
  "{2}{W}, Sacrifice three other creatures: Exile Elesh Norn, then return it to the battlefield transformed under its owner's control. Activate only as a sorcery.";

const tax = (to: "you" | "permanent"): TriggeredAbility => ({
  trigger:
    to === "you"
      ? { on: "deals-damage", who: "opponent", to: "you" }
      : { on: "deals-damage", who: "opponent", to: "permanent", toFilter: { controlledBy: "you" } },
  targets: [],
  effect: {
    kind: "unless",
    chooser: "trigger-controller",
    options: [{ pay: "{1}", text: "Pay {1}" }],
    otherwise: { kind: "lose-life", amount: 2, who: "trigger-controller" },
  },
  resolve: null,
  text: TAX_TEXT,
});

export default defineCard({
  name: "Elesh Norn",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Praetor"],
  power: 3,
  toughness: 5,
  keywords: ["vigilance"],
  text: `Vigilance\n${TAX_TEXT}\n${TRANSFORM_TEXT}`,
  faces: ["Elesh Norn", "The Argent Etchings"],
  transform: true,
  triggered: [tax("you"), tax("permanent")],
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false, sacrifice: { filter: { type: "creature" }, count: 3 } },
      otherOnly: true,
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
});
