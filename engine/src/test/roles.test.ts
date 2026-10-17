/**
 * Role tokens (rules 111.10j–r, 303.7): colorless Aura Role enchantment
 * tokens, each created attached to a creature (the `create-token` effect's
 * `attachedTo`). Of the Roles one player controls on one permanent, only the
 * one with the most recent timestamp stays (rule 704.5z); a Role that can't
 * legally enchant its permanent isn't created (the Role rulings).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, enter, grant, graveyard, lands, life, pickTargets, pt, ref, settle, spawn, table, toStep, zone } from "./harness.js";

const rolesOn = (game: Game, host: ObjectId): string[] =>
  game.state.zones.shared.battlefield
    .filter((id) => game.state.objects[id].attachedTo === host)
    .map((id) => game.state.objects[id].cardName);

describe("Role tokens", () => {
  it("Spiteful Hexmage: a Cursed Role created attached to the target makes it a 1/1", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    pickTargets(a, giant);
    enter(game, "Spiteful Hexmage");
    expect(rolesOn(game, giant)).toEqual(["Cursed Role Token"]);
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
  });

  it("Cursed Courtier: attached to itself", () => {
    const { game } = table();
    const courtier = enter(game, "Cursed Courtier");
    expect(rolesOn(game, courtier)).toEqual(["Cursed Role Token"]);
    expect(pt(game, courtier)).toEqual({ power: 1, toughness: 1 });
  });

  it("a newer Role of the same player replaces the older one (rule 704.5z)", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    pickTargets(a, giant);
    enter(game, "Spiteful Hexmage");
    const veteran = spawn(game, "Embereth Veteran");
    lands(game, "Mountain", 1);
    activate(game, veteran, 0, { targets: [ref(giant)] });
    expect(rolesOn(game, giant)).toEqual(["Young Hero Role Token"]);
    // The Cursed Role went to the graveyard and ceased to exist (rule 111.7):
    // the Hill Giant is a 3/3 again.
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });

  it("Roles controlled by different players on one permanent all stay", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    pickTargets(a, giant);
    enter(game, "Spiteful Hexmage");
    const veteran = spawn(game, "Embereth Veteran", B);
    lands(game, "Mountain", 1, B);
    game.dispatch({ type: "pass-priority", player: A });
    activate(game, veteran, 0, { player: B, targets: [ref(giant)] });
    expect(rolesOn(game, giant).sort()).toEqual(["Cursed Role Token", "Young Hero Role Token"]);
  });

  it("a permanent the Role can't enchant gets none — none is created; hexproof doesn't stop one", () => {
    const { game } = table();
    const relic = spawn(game, "Mind Stone");
    game.debugApplyEffect(A, { kind: "create-token", token: "Monster Role Token", count: 1, attachedTo: 0 }, [ref(relic)]);
    settle(game);
    expect(game.state.zones.shared.battlefield.some((id) => game.state.objects[id].cardName === "Monster Role Token")).toBe(false);
    const bears = spawn(game, "Grizzly Bears", B);
    grant(game, bears, "hexproof");
    game.debugApplyEffect(A, { kind: "create-token", token: "Monster Role Token", count: 1, attachedTo: 0 }, [ref(bears)]);
    settle(game);
    expect(rolesOn(game, bears)).toEqual(["Monster Role Token"]);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("Young Hero: attacking with toughness 3 or less gets a +1/+1 counter — an intervening if", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const veteran = spawn(game, "Embereth Veteran");
    lands(game, "Mountain", 1);
    activate(game, veteran, 0, { targets: [ref(bears)] });
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "postcombat-main");
    settle(game);
    expect(game.state.objects[bears].counters["+1/+1"]).toBe(1);
    expect(life(game, B)).toBe(20 - 3);
    expect(graveyard(game).length).toBeGreaterThan(0);
    expect(zone(game, veteran)).toBe("graveyard");
  });
});
