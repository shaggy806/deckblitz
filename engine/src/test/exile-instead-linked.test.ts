/**
 * A graveyard-exile replacement that exiles the card **with** its permanent
 * (`GraveyardExileReplacement.linked`, rule 607.2b), so that permanent's
 * linked abilities find it:
 *   - The Darkness Crystal: "If a nontoken creature an opponent controls would
 *     die, instead exile it and you gain 2 life", and its "{4}{B}{B}, {T}: Put
 *     target creature card exiled with The Darkness Crystal onto the
 *     battlefield tapped under your control with two additional +1/+1
 *     counters on it";
 *   - Gisa, Glorious Resurrector: the replacement alone, and "put all creature
 *     cards exiled with Gisa onto the battlefield under your control. They
 *     gain decayed".
 * Given up when the moving object's controller picks another exile that could
 * apply (rule 616.1): Rest in Peace's.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, controller, counters, destroy, keywords, life, lands, settle, spawn, table, toExile, toStep, zone, ref } from "./harness.js";

describe("The Darkness Crystal", () => {
  it("exiles an opponent's dying nontoken creature with it, and its controller gains 2 life", () => {
    const { game } = table();
    const crystal = spawn(game, "The Darkness Crystal");
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("exile");
    expect(game.state.objects[bears].exiledWith?.source).toBe(crystal);
    expect(life(game, A)).toBe(22);
  });

  it("lets its controller's own creature die, and a token of an opponent's go to the graveyard", () => {
    const { game } = table();
    spawn(game, "The Darkness Crystal");
    const mine = spawn(game, "Grizzly Bears", A);
    destroy(game, mine);
    expect(zone(game, mine)).toBe("graveyard");
    game.debugApplyEffect(B, { kind: "create-token", token: "Zombie Token", count: 1 }, []);
    const zombie = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Zombie Token")!;
    destroy(game, zombie);
    expect(game.state.objects[zombie]?.zone).not.toBe("battlefield");
    expect(life(game, A)).toBe(20);
  });

  it("puts a card exiled with it onto the battlefield tapped under its controller, with two +1/+1 counters", () => {
    const { game } = table({ deck: "Swamp" });
    const crystal = spawn(game, "The Darkness Crystal");
    lands(game, "Swamp", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, bears);
    // A creature card exiled some other way isn't one it can reach.
    const other = toExile(game, "Hill Giant", B);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: crystal, abilityIndex: 0, targets: [ref(other)] })).not.toBeNull();
    activate(game, crystal, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears)).toBe(2);
  });

  it("dying beside its opponents' creatures, still exiles them and gains the life (its ruling)", () => {
    const { game } = table();
    spawn(game, "The Darkness Crystal");
    spawn(game, "Grizzly Bears", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { anyOf: [{ type: "creature" }, { type: "artifact" }] } }, []);
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, giant)).toBe("exile");
    expect(life(game, A)).toBe(24);
  });

  it("with Rest in Peace out too, the dying creature's controller picks Rest in Peace's: no life, not linked", () => {
    const { game } = table();
    spawn(game, "The Darkness Crystal");
    spawn(game, "Rest in Peace", A);
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("exile");
    expect(game.state.objects[bears].exiledWith).toBeUndefined();
    expect(life(game, A)).toBe(20);
  });
});

describe("Gisa, Glorious Resurrector", () => {
  it("exiles an opponent's dying creature with her, and puts it back under her controller at upkeep with decayed", () => {
    const { game } = table();
    const gisa = spawn(game, "Gisa, Glorious Resurrector");
    const crystal = spawn(game, "The Darkness Crystal", B);
    const bears = spawn(game, "Grizzly Bears", B);
    // One of Alice's creatures dies under Bob's Crystal: exiled with the
    // Crystal, not Gisa — her trigger leaves it.
    const mine = spawn(game, "Hill Giant", A);
    destroy(game, bears);
    destroy(game, mine, A);
    expect(game.state.objects[bears].exiledWith?.source).toBe(gisa);
    expect(game.state.objects[mine].exiledWith?.source).toBe(crystal);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(keywords(game, bears).has("decayed")).toBe(true);
    expect(zone(game, mine)).toBe("exile");
    // Gisa herself doesn't gain decayed.
    expect(keywords(game, gisa).has("decayed")).toBe(false);
  });

  it("a Gisa that left and came back is a new object, whose trigger finds nothing (rule 400.7)", () => {
    const { game } = table();
    const gisa = spawn(game, "Gisa, Glorious Resurrector");
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, bears);
    game.debugApplyEffect(A, { kind: "flicker", target: 0 }, [ref(gisa)]);
    settle(game);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("exile");
  });
});
