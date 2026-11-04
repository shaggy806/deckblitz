/**
 * Every graveyard onto the battlefield at once: `return-from-graveyard`'s
 * `all-graveyards` under the caster's control (Rise of the Dark Realms) and
 * `each-graveyard` under each owner's (Roar of Reclamation, Myr Servitor).
 */
import { describe, expect, it } from "vitest";
import { A, B, C, D, cast, controller, destroy, graveyard, lands, nextTurn, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

describe("Rise of the Dark Realms", () => {
  it("puts every creature card from every graveyard under your control, and nothing else", () => {
    const { game } = table({ players: 4 });
    lands(game, "Swamp", 9);
    const mine = toGraveyard(game, "Grizzly Bears", A);
    const bobs = toGraveyard(game, "Hill Giant", B);
    const carols = toGraveyard(game, "Serra Angel", C);
    const davesLand = toGraveyard(game, "Forest", D);
    const bobsSpell = toGraveyard(game, "Lightning Bolt", B);
    const rise = toHand(game, "Rise of the Dark Realms");
    cast(game, rise);
    for (const id of [mine, bobs, carols]) {
      expect(zone(game, id)).toBe("battlefield");
      expect(controller(game, id)).toBe(A);
    }
    expect(zone(game, davesLand)).toBe("graveyard");
    expect(zone(game, bobsSpell)).toBe("graveyard");
    expect(zone(game, rise)).toBe("graveyard");
  });

  it("they enter together: each sees the others enter, and stay yours past the turn", () => {
    const { game } = table();
    lands(game, "Swamp", 9);
    // Soul Warden gains 1 for each other creature that enters, itself among those returned.
    const warden = toGraveyard(game, "Soul Warden", B);
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Hill Giant", A);
    const before = game.state.players[A].life;
    cast(game, toHand(game, "Rise of the Dark Realms"));
    expect(zone(game, warden)).toBe("battlefield");
    expect(game.state.players[A].life).toBe(before + 2);
    nextTurn(game);
    expect(controller(game, warden)).toBe(A);
  });

  it("goes home to its owner's graveyard when it dies", () => {
    const { game } = table();
    lands(game, "Swamp", 9);
    const bobs = toGraveyard(game, "Hill Giant", B);
    cast(game, toHand(game, "Rise of the Dark Realms"));
    destroy(game, bobs);
    settle(game);
    expect(graveyard(game, B)).toContain(bobs);
  });
});

describe("Roar of Reclamation", () => {
  it("returns each player's artifact cards under their own control, and nothing else", () => {
    const { game } = table({ players: 4 });
    lands(game, "Plains", 7);
    const mine = toGraveyard(game, "Mind Stone", A);
    const bobs = toGraveyard(game, "Sol Ring", B);
    const carols = toGraveyard(game, "Solemn Simulacrum", C);
    const bears = toGraveyard(game, "Grizzly Bears", D);
    cast(game, toHand(game, "Roar of Reclamation"));
    expect(controller(game, mine)).toBe(A);
    expect(zone(game, bobs)).toBe("battlefield");
    expect(controller(game, bobs)).toBe(B);
    expect(zone(game, carols)).toBe("battlefield");
    expect(controller(game, carols)).toBe(C);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Myr Servitor", () => {
  it("returns every player's Myr Servitors at your upkeep, each to its owner, and no other card", () => {
    const { game } = table();
    spawn(game, "Myr Servitor", B);
    const mine = toGraveyard(game, "Myr Servitor", A);
    const theirs = toGraveyard(game, "Myr Servitor", B);
    const other = toGraveyard(game, "Ornithopter", B);
    // Bob's upkeep: his Servitor's trigger.
    nextTurn(game);
    expect(zone(game, mine)).toBe("battlefield");
    expect(controller(game, mine)).toBe(A);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(controller(game, theirs)).toBe(B);
    expect(zone(game, other)).toBe("graveyard");
  });

  it("doesn't trigger from a graveyard, or on another player's upkeep", () => {
    const { game } = table();
    spawn(game, "Myr Servitor", A);
    const theirs = toGraveyard(game, "Myr Servitor", B);
    // Bob's upkeep: alice's Servitor doesn't care.
    nextTurn(game);
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("does nothing if it left in response (rule 603.4)", () => {
    const { game } = table({ step: "precombat-main" });
    const servitor = spawn(game, "Myr Servitor", B);
    const mine = toGraveyard(game, "Myr Servitor", A);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep" && s.priority.holder !== null);
    expect(game.state.zones.shared.stack.length).toBe(1);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [{ kind: "object", object: servitor }]);
    settle(game);
    expect(zone(game, servitor)).toBe("graveyard");
    expect(zone(game, mine)).toBe("graveyard");
  });
});
