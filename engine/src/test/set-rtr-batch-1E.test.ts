import { describe, expect, it } from "vitest";
import { restrictionsOf } from "../characteristics.js";
import { whyCannotBlock } from "../combat/eligibility.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  hand,
  lands,
  life,
  pt,
  ref,
  spawn,
  table,
  toHand,
  types,
  zone,
  nextTurn,
} from "./harness.js";

describe("Return to Ravnica, group E", () => {
  it("Havoc Festival: players can't gain life; each upkeep, that player loses half their life rounded up", () => {
    const { game } = table();
    spawn(game, "Havoc Festival");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    expect(life(game, A)).toBe(20);
    game.state.players[B].life = 19;
    nextTurn(game, "draw");
    expect(life(game, B)).toBe(9);
    expect(life(game, A)).toBe(20);
  });

  it("Lobber Crew untaps when you cast a multicolored spell", () => {
    const { game } = table();
    const crew = spawn(game, "Lobber Crew");
    activate(game, crew);
    expect(life(game, B)).toBe(19);
    expect(game.state.objects[crew].tapped).toBe(true);
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Teleportal"), { targets: [ref(crew)] });
    expect(game.state.objects[crew].tapped).toBe(false);
  });

  it("Teleportal overloaded: +1/+0 to creatures there now, can't be blocked for creatures you control later", () => {
    const { game, a } = table();
    const first = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 3);
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Teleportal"), { overload: true });
    const late = spawn(game, "Grizzly Bears");
    expect(pt(game, first)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, late)).toEqual({ power: 2, toughness: 2 });
    expect(restrictionsOf(game.state, game.registry, first).has("cant-be-blocked")).toBe(true);
    expect(restrictionsOf(game.state, game.registry, late).has("cant-be-blocked")).toBe(true);
    a.declareAttackersFn = () => [first, late].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-blockers" || s.awaiting?.kind === "blockers");
    expect(game.state.turn.number).toBe(1);
    expect(game.state.objects[late].attacking).toBe(B);
    expect(whyCannotBlock(game.state, game.registry, B, blocker, first)).toMatch(/can't be blocked/);
    expect(whyCannotBlock(game.state, game.registry, B, blocker, late)).toMatch(/can't be blocked/);
  });

  it("Dryad Militant exiles an instant that would go to the graveyard", () => {
    const { game } = table();
    spawn(game, "Dryad Militant");
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("exile");
  });

  it("Skull Rend: 2 damage to each opponent, who each discard two at random", () => {
    const { game } = table({ players: 3 });
    const before = hand(game, B).length;
    lands(game, "Wastes", 3);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Skull Rend"));
    expect(life(game, B)).toBe(18);
    expect(hand(game, B).length).toBe(before - 2);
    expect(life(game, A)).toBe(20);
  });

  it("Izzet Keyrune becomes a 2/1 blue and red Elemental artifact creature", () => {
    const { game } = table();
    const rune = spawn(game, "Izzet Keyrune");
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    activate(game, rune, 1);
    expect(types(game, rune)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, rune)).toEqual({ power: 2, toughness: 1 });
  });

  it("Wayfaring Temple counts the creatures you control", () => {
    const { game } = table();
    const temple = spawn(game, "Wayfaring Temple");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, temple)).toEqual({ power: 3, toughness: 3 });
  });

  it("Rakdos Ringleader: combat damage to a player makes them discard at random", () => {
    const { game, a } = table();
    const ringleader = spawn(game, "Rakdos Ringleader");
    const before = hand(game, B).length;
    attack(game, a, [ringleader]);
    expect(life(game, B)).toBe(17);
    expect(hand(game, B).length).toBe(before - 1);
  });

  it("Dark Revenant goes on top of its owner's library when it dies", () => {
    const { game } = table();
    const revenant = spawn(game, "Dark Revenant");
    destroy(game, revenant);
    const top = game.state.zones.perPlayer[A].library[0];
    expect(game.state.objects[top].cardName).toBe("Dark Revenant");
  });

  it("Golgari Decoy scavenges from the graveyard for its power", () => {
    const { game } = table();
    const decoy = game.debugSpawn("Golgari Decoy", A, "graveyard");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    lands(game, "Forest", 2);
    activate(game, decoy, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(zone(game, decoy)).toBe("exile");
  });
});
