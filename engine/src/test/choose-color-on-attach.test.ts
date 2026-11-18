/**
 * "As this Equipment becomes attached to a creature, choose a color.
 * Equipped creature gets +2/+0 and has protection from the last chosen
 * color." (Sanctuary Blade): `asBecomesAttached` (Psychic Paper's) running a
 * `choose-value` of a color whose answer the Equipment notes (`note`'s
 * `word`, `GameObject.chosenOnEnter`), read by a protection static per color.
 * The choice is made before the state-based actions are next checked, so an
 * Aura of the old color doesn't fall off the new creature.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { B, activate, cast, lands, pt, ref, registryOf, spawn, table, toHand, zone } from "./harness.js";

const protectionOf = (game: Game, id: ObjectId): string[] => [
  ...computeCharacteristics(game.state, registryOf(game), id).protectionFrom.colors,
];

describe("Sanctuary Blade", () => {
  it("equipped, its controller chooses a color: +2/+0 and protection from it", () => {
    const { game, a } = table();
    const blade = spawn(game, "Sanctuary Blade");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    let offered: readonly string[] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      offered = options;
      return "U";
    };
    activate(game, blade, 0, { targets: [ref(bears)] });
    expect(offered).toEqual(["W", "U", "B", "R", "G"]);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(protectionOf(game, bears)).toEqual(["U"]);
  });

  it("chooses again each time it becomes attached; the last chosen color stands, not when re-equipped where it is", () => {
    const { game, a } = table();
    const blade = spawn(game, "Sanctuary Blade");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    lands(game, "Wastes", 9);
    const colors = ["U", "R", "G"];
    let asked = 0;
    a.chooseCreatureTypeFn = () => {
      asked += 1;
      return colors.shift() ?? "W";
    };
    activate(game, blade, 0, { targets: [ref(bears)] });
    activate(game, blade, 0, { targets: [ref(giant)] });
    expect(protectionOf(game, bears)).toEqual([]);
    expect(protectionOf(game, giant)).toEqual(["R"]);
    // Equipped to the creature it's on already: it doesn't become attached
    // (rule 701.3b), so no new color (the ruling).
    activate(game, blade, 0, { targets: [ref(giant)] });
    expect(asked).toBe(2);
    expect(protectionOf(game, giant)).toEqual(["R"]);
  });

  it("the new color is chosen before the state-based actions: an Aura of the old one stays", () => {
    const { game, a } = table();
    const blade = spawn(game, "Sanctuary Blade");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const aura = spawn(game, "Firebreathing");
    game.state.objects[aura].attachedTo = giant;
    lands(game, "Wastes", 6);
    const colors = ["R", "U"];
    a.chooseCreatureTypeFn = () => colors.shift() ?? "W";
    activate(game, blade, 0, { targets: [ref(bears)] });
    activate(game, blade, 0, { targets: [ref(giant)] });
    expect(protectionOf(game, giant)).toEqual(["U"]);
    expect(zone(game, aura)).toBe("battlefield");
  });

  it("a color chosen as another effect attaches it, by the Blade's controller; protection from it drops that color's Aura", () => {
    const { game, a, b } = table();
    const blade = spawn(game, "Sanctuary Blade", B);
    const bears = spawn(game, "Grizzly Bears");
    const aura = spawn(game, "Firebreathing");
    game.state.objects[aura].attachedTo = bears;
    a.chooseCreatureTypeFn = () => {
      throw new Error("alice doesn't control Sanctuary Blade");
    };
    b.chooseCreatureTypeFn = () => "R";
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Magnetic Theft"), { targets: [ref(blade), ref(bears)] });
    expect(game.state.objects[blade].attachedTo).toBe(bears);
    expect(protectionOf(game, bears)).toEqual(["R"]);
    // Protection from red: the red Aura is put into its owner's graveyard
    // (rule 704.5m).
    expect(zone(game, aura)).toBe("graveyard");
  });

  it("attached with no color chosen, it grants no protection", () => {
    const { game } = table();
    const blade = spawn(game, "Sanctuary Blade");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[blade].attachedTo = bears;
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(protectionOf(game, bears)).toEqual([]);
  });
});
