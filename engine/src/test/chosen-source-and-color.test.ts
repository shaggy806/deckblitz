/**
 * Damage from a source of your choice (rule 609.7 — the Circles of
 * Protection, Reverse Damage, Healing Grace): the source, a permanent or a
 * spell on the stack, is chosen as the effect resolves; the shield prevents
 * only that source's damage, rechecks its colour (609.7b), and isn't used up
 * by damage it doesn't cover. And `become-color` (layer 5 — the Laces, the
 * Wisps): a spell or permanent's colours set, for good or until end of turn.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, lands, life, nextTurn, pickPermanents, ref, registryOf, spawn, table, toHand } from "./harness.js";

const colorsOf = (game: Game, id: ObjectId): string[] =>
  [...computeCharacteristics(game.state, registryOf(game), id).colors].sort();
/** `source` deals 2 damage to each of its controller's opponents. */
const ping = (game: Game, source: ObjectId): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount: 2, who: "each-opponent" }, [], {
    source,
  });

describe("prevent-damage-from-chosen-source", () => {
  it("Circle of Protection: Red stops the chosen red source's next damage to you, once", () => {
    const { game, a } = table();
    const circle = spawn(game, "Circle of Protection: Red");
    lands(game, "Plains", 2);
    const goblin = spawn(game, "Raging Goblin", B);
    const other = spawn(game, "Raging Goblin", B);
    const seen = pickPermanents(a, goblin);
    activate(game, circle, 0);
    // Only red sources are offered, its own and the opponent's alike.
    expect(seen.offered).toContain(goblin);
    expect(seen.offered).toContain(other);
    expect(seen.offered).not.toContain(circle);
    ping(game, other);
    expect(life(game, A)).toBe(18);
    ping(game, goblin);
    expect(life(game, A)).toBe(18);
    // "The next time": the second hit gets through.
    ping(game, goblin);
    expect(life(game, A)).toBe(16);
  });

  it("chooses a spell on the stack: Shock aimed at you is prevented", () => {
    const { game, a } = table();
    const circle = spawn(game, "Circle of Protection: Red");
    lands(game, "Plains", 1);
    lands(game, "Mountain", 1, B);
    const shock = toHand(game, "Shock", B);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, shock, { player: B, targets: [ref(A)], settle: false });
    game.dispatch({ type: "pass-priority", player: B });
    const seen = pickPermanents(a, shock);
    activate(game, circle, 0);
    expect(seen.offered).toContain(shock);
    expect(life(game, A)).toBe(20);
  });

  it("rechecks the colour: a source that stopped being red isn't stopped, and the shield stays", () => {
    const { game, a } = table();
    const circle = spawn(game, "Circle of Protection: Red");
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    const goblin = spawn(game, "Raging Goblin", B);
    pickPermanents(a, goblin);
    activate(game, circle, 0);
    cast(game, toHand(game, "Thoughtlace"), { targets: [ref(goblin)] });
    expect(colorsOf(game, goblin)).toEqual(["U"]);
    ping(game, goblin);
    expect(life(game, A)).toBe(18);
    expect(game.state.preventionShields).toHaveLength(1);
  });

  it("ends with the turn", () => {
    const { game, a } = table();
    const circle = spawn(game, "Circle of Protection: Red");
    lands(game, "Plains", 1);
    const goblin = spawn(game, "Raging Goblin", B);
    pickPermanents(a, goblin);
    activate(game, circle, 0);
    nextTurn(game);
    ping(game, goblin);
    expect(life(game, A)).toBe(18);
  });

  it("Reverse Damage: you gain life equal to the damage prevented", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const giant = spawn(game, "Hill Giant", B);
    pickPermanents(a, giant);
    cast(game, toHand(game, "Reverse Damage"));
    game.debugApplyEffect(B, { kind: "damage", amount: 3, who: "each-opponent" }, [], { source: giant });
    expect(life(game, A)).toBe(23);
  });

  it("Healing Grace: the next 3 damage to the target from the chosen source, then you gain 3", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    pickPermanents(a, giant);
    cast(game, toHand(game, "Healing Grace"), { targets: [ref(bears)] });
    expect(life(game, A)).toBe(23);
    game.debugApplyEffect(B, { kind: "damage", amount: 4, target: 0 }, [ref(bears)], { source: giant });
    // 3 of the 4 prevented: the Bears survive with 1 damage.
    expect(game.state.objects[bears].zone).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(1);
  });
});

describe("become-color", () => {
  it("Deathlace makes a permanent black for good; Crimson Wisps makes one red until end of turn", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    cast(game, toHand(game, "Deathlace"), { targets: [ref(bears)] });
    cast(game, toHand(game, "Crimson Wisps"), { targets: [ref(lions)] });
    expect(colorsOf(game, bears)).toEqual(["B"]);
    expect(colorsOf(game, lions)).toEqual(["R"]);
    nextTurn(game);
    expect(colorsOf(game, bears)).toEqual(["B"]);
    expect(colorsOf(game, lions)).toEqual(["W"]);
  });

  it("a spell on the stack changes colour, and the permanent it becomes has its own", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Swamp", 1);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    // Holding priority: Deathlace the Bears spell.
    cast(game, toHand(game, "Deathlace"), { targets: [ref(bears)], settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.objects[bears].zone).toBe("stack");
    expect(colorsOf(game, bears)).toEqual(["B"]);
    game.dispatch({ type: "pass-priority", player: A });
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.objects[bears].zone).toBe("battlefield");
    expect(colorsOf(game, bears)).toEqual(["G"]);
  });
});
