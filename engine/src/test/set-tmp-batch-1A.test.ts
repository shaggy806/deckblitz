import { describe, expect, it } from "vitest";
import { A, B, activate, cast, destroy, keywords, lands, life, ref, settle, spawn, table, toHand, toStep, tokensNamed, zone } from "./harness.js";

// Tempest (TMP), batch B178 group A.

describe("Respite", () => {
  it("prevents the combat damage and gains 1 life per attacking creature", () => {
    const { game, a } = table();
    const bears = [spawn(game, "Grizzly Bears", A), spawn(game, "Grizzly Bears", A)];
    lands(game, "Forest", 2);
    const respite = toHand(game, "Respite");
    a.declareAttackersFn = () => bears.map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null);
    cast(game, respite);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(22);
  });
});

describe("Mongrel Pack", () => {
  it("makes four green Dogs when it dies during combat, even not in combat", () => {
    const { game } = table();
    const pack = spawn(game, "Mongrel Pack", A);
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A);
    destroy(game, pack);
    expect(zone(game, pack)).toBe("graveyard");
    expect(tokensNamed(game, "1/1 Green Dog Token", A)).toBe(4);
  });

  it("makes nothing when it dies outside combat", () => {
    const { game } = table();
    const pack = spawn(game, "Mongrel Pack", A);
    destroy(game, pack);
    expect(zone(game, pack)).toBe("graveyard");
    expect(tokensNamed(game, "1/1 Green Dog Token")).toBe(0);
  });
});

describe("Bounty Hunter", () => {
  it("marks a nonblack creature, then destroys only a creature with a bounty counter", () => {
    const { game } = table();
    const [h1, h2] = [spawn(game, "Bounty Hunter", A), spawn(game, "Bounty Hunter", A)];
    const bears = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, h2, 1, { targets: [ref(other)] })).toThrow(/refused/);
    activate(game, h1, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].counters.bounty).toBe(1);
    activate(game, h2, 1, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, other)).toBe("battlefield");
  });
});

describe("Clot Sliver", () => {
  it("gives every Sliver, an opponent's too, a {2} regeneration ability", () => {
    const { game } = table();
    const clot = spawn(game, "Clot Sliver", B);
    const talon = spawn(game, "Talon Sliver", A);
    lands(game, "Swamp", 2, A);
    // Bob's Talon-less Clot Sliver gets alice's Talon Sliver's first strike.
    expect(keywords(game, clot).has("first-strike")).toBe(true);
    activate(game, talon, 0);
    destroy(game, talon);
    expect(zone(game, talon)).toBe("battlefield");
    expect(game.state.objects[talon].tapped).toBe(true);
  });
});

describe("Root Maze", () => {
  it("makes lands enter tapped, every player's", () => {
    const { game } = table();
    spawn(game, "Root Maze", B);
    const forest = toHand(game, "Forest", A);
    game.dispatch({ type: "play-land", player: A, card: forest });
    settle(game);
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
  });
});

describe("Rootwater Depths", () => {
  it("its {U}/{B} ability holds it tapped through the next untap step", () => {
    const { game } = table();
    const depths = spawn(game, "Rootwater Depths", A);
    activate(game, depths, 1);
    expect(game.state.objects[depths].tapped).toBe(true);
    toStep(game, "precombat-main", A); // alice's next turn
    expect(game.state.objects[depths].tapped).toBe(true);
    toStep(game, "precombat-main", A); // and the one after
    expect(game.state.objects[depths].tapped).toBe(false);
  });

  it("its {C} ability doesn't", () => {
    const { game } = table();
    const depths = spawn(game, "Rootwater Depths", A);
    activate(game, depths, 0);
    expect(game.state.objects[depths].tapped).toBe(true);
    toStep(game, "precombat-main", A);
    expect(game.state.objects[depths].tapped).toBe(false);
  });
});
